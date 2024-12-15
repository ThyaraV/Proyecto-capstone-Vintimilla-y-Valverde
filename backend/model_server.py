import base64
import io
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import tensorflow as tf
from flask_cors import CORS  # Importar CORS
import os
import time


app = Flask(__name__)
CORS(app)  # Permitir CORS

# Crear una carpeta para guardar las imágenes recibidas (si no existe)
if not os.path.exists('received_images'):
    os.makedirs('received_images')

# Cargar el modelo al iniciar la app
try:
    model = tf.keras.models.load_model('model.h5')  # Asegúrate de que 'model.h5' esté en la ruta correcta
    print("Modelo cargado correctamente.")
except Exception as e:
    print(f"Error al cargar el modelo: {e}")
    exit(1)

img_height = 224
img_width = 224

def preprocess_image(img):
    """
    Preprocesa la imagen para que sea compatible con el modelo.
    """
    img = img.convert('RGB')
    img = img.resize((img_width, img_height))  # Redimensionar la imagen
    img_array = np.array(img)  # Convertir a numpy array
    img_array = np.expand_dims(img_array, axis=0)  # Agregar dimensión batch
    # Normalizar según el preprocesamiento usado en el entrenamiento
    # Si usaste MobileNetV2 con pesos de ImageNet:
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    return img_array

@app.route('/api/evaluate-cube', methods=['POST'])
def evaluate():
    """
    Evalúa el dibujo del cubo y devuelve un puntaje (0 o 1).
    """
    data = request.get_json()
    image_data = data.get('image', '')

    if not image_data.startswith('data:image'):
        return jsonify({"error": "No es una imagen válida."}), 400

    try:
        header, encoded = image_data.split(',', 1)
        img_bytes = base64.b64decode(encoded)
        
        # Guardar la imagen recibida para inspección
        image_filename = f"received_images/cube_{int(time.time())}.png"
        with open(image_filename, "wb") as f:
            f.write(img_bytes)
        print(f"Imagen recibida y guardada como {image_filename}")

        img = Image.open(io.BytesIO(img_bytes))
        img_array = preprocess_image(img)

        # Realizar inferencia con el modelo
        preds = model.predict(img_array)
        print(f"Predicciones del modelo: {preds}")

        # Asumiendo que el modelo usa una activación sigmoid y devuelve una probabilidad
        score = 1 if preds[0][0] >= 0.5 else 0

        print(f"Puntaje asignado: {score}")
        return jsonify({"score": int(score)})

    except Exception as e:
        print(f"Error al procesar la imagen: {e}")
        return jsonify({"error": "Error al procesar la imagen."}), 500

if __name__ == '__main__':
    # Ejecutar en el puerto 5001 para no chocar con Node
    app.run(host='0.0.0.0', port=5001, debug=True)
