import io
from flask import Flask, request, jsonify, send_file, make_response # type: ignore
from flask_cors import CORS # type: ignore
from PIL import Image # type: ignore
from io import BytesIO
from neural_transfer import perform_style_transfer

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST'])
def file_upload():
    if 'content' not in request.files or 'style' not in request.files:
        return jsonify({'error': 'No files found in the request'}), 400

    content_images = request.files.getlist('content')
    art_style_images = request.files.getlist('style')
    num_steps = int(request.form.get('steps')) if 'steps' in request.form else None
    style_weight = int(request.form.get('weight')) if 'weight' in request.form else None
    

    if num_steps == 0:
        return jsonify({'error': 'Please enter number of steps'}), 404

    generated_images = []

    for i, (content_image, art_style_image) in enumerate(zip(content_images, art_style_images), start=1):
        if not allowed_file(content_image.filename) or not allowed_file(art_style_image.filename):
            return jsonify({'error': 'Invalid file format. Allowed formats are PNG, JPG, and JPEG.'}), 400

        content_image_bytes = BytesIO(content_image.read())
        art_style_image_bytes = BytesIO(art_style_image.read())

        try:
            result = perform_style_transfer(content_image_bytes, art_style_image_bytes, num_steps, style_weight)
            result_bytes = BytesIO()
            result.save(result_bytes, format='png')
            result_bytes.seek(0)
            generated_images.append(result_bytes)
        except Exception as e:
            return jsonify({'error': f'An error occurred during style transfer: {str(e)}'}), 500

    response = make_response(send_file(generated_images[0], mimetype='image/png'))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


if __name__ == "__main__":
    app.run(debug=True)
