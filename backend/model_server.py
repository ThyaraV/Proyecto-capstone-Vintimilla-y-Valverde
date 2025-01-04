import base64
import io
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import tensorflow as tf
from flask_cors import CORS
import os
import time

app = Flask(__name__)
CORS(app)

# Carpeta para imágenes recibidas (opcional)
RECEIVED_IMAGES_DIR = 'received_images'
if not os.path.exists(RECEIVED_IMAGES_DIR):
    os.makedirs(RECEIVED_IMAGES_DIR)

# Cargar el modelo
MODEL_PATH = 'model.h5'

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Modelo cargado correctamente desde {MODEL_PATH}.")
except Exception as e:
    print(f"Error al cargar el modelo desde {MODEL_PATH}: {e}")
    exit(1)

img_height = 224
img_width = 224

def preprocess_image(img):
    """
    Preprocesa la imagen para que sea compatible con MobileNetV2.
    """
    img = img.convert('RGB')
    img = img.resize((img_width, img_height))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    # Preprocesamiento MobileNetV2
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    return img_array

@app.route('/api/evaluate-cube', methods=['POST'])
def evaluate():
    """
    Endpoint para evaluar el dibujo del cubo.
    Recibe una imagen en base64, la procesa y devuelve el puntaje y probabilidad.
    """
    data = request.get_json()
    image_data = data.get('image', '')

    # Validar que la imagen está en formato base64
    if not image_data.startswith('data:image'):
        return jsonify({"error": "No es una imagen válida."}), 400

    try:
        # Decodificar la imagen
        header, encoded = image_data.split(',', 1)
        img_bytes = base64.b64decode(encoded)

        # Guardar imagen recibida (opcional, para debug)
        timestamp = int(time.time())
        image_filename = os.path.join(RECEIVED_IMAGES_DIR, f"cube_{timestamp}.png")
        with open(image_filename, "wb") as f:
            f.write(img_bytes)
        print(f"Imagen recibida y guardada como {image_filename}")

        # Procesar la imagen
        img = Image.open(io.BytesIO(img_bytes))
        img_array = preprocess_image(img)

        # Realizar inferencia
        preds = model.predict(img_array)
        print(f"Predicciones del modelo: {preds}")

        # Obtener probabilidad y puntaje
        probabilidad = float(preds[0][0])  # Probabilidad entre 0.0 y 1.0
        score = 0 if probabilidad >= 0.7 else 1

        print(f"Puntaje asignado: {score}, Probabilidad: {probabilidad:.4f}")

        # Devolver respuesta con score y probabilidad
        return jsonify({
            "score": score,
            "prob": probabilidad
        })

    except Exception as e:
        print(f"Error al procesar la imagen: {e}")
        return jsonify({"error": "Error al procesar la imagen."}), 500

if __name__ == '__main__':
    # Ejecutar el servidor Flask
    app.run(host='0.0.0.0', port=5001, debug=True)
