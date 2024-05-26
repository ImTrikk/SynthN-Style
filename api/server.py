import signal
import sys
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from model.main import perform_style_transfer
import logging

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

# Set up logging
logging.basicConfig(level=logging.INFO)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def file_upload():
    if 'content' not in request.files:
        return jsonify({'error': 'No files content found'}), 400
    
    if 'style' not in request.files:
        return jsonify({'error': 'No files style found'}), 400

    content_images = request.files.getlist('content')
    art_style_images = request.files.getlist('style')
    num_steps = int(request.form.get('steps', 0))
    style_weight = int(request.form.get('weight', 0))

    if num_steps <= 0:
        return jsonify({'error': 'Please enter a positive number of steps'}), 400

    generated_images = []
    
    for content_image, art_style_image in zip(content_images, art_style_images):
        if not allowed_file(content_image.filename) or not allowed_file(art_style_image.filename):
            return jsonify({'error': 'Invalid file format. Allowed formats are PNG, JPG, and JPEG.'}), 400

        content_image_bytes = BytesIO(content_image.read())
        art_style_image_bytes = BytesIO(art_style_image.read())

        try:
            result = perform_style_transfer(content_image_bytes, art_style_image_bytes, num_steps, style_weight)
            result_bytes = BytesIO()
            result.save(result_bytes, format='PNG')
            result_bytes.seek(0)
            generated_images.append(result_bytes)
        except Exception as e:
            logging.error(f'Error during style transfer: {e}')
            return jsonify({'error': f'An error occurred during style transfer: {str(e)}'}), 500

    if not generated_images:
        return jsonify({'error': 'No images were generated'}), 500

    response = make_response(send_file(generated_images[0], mimetype='image/png'))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def handle_exit(signum, frame):
    logging.info('Gracefully shutting down...')
    # Perform cleanup tasks here
    sys.exit(0)

signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

if __name__ == "__main__":
    app.run(debug=True)
