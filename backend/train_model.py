import tensorflow as tf
import os

# Ruta a tus datos
base_dir = "data"
train_dir = os.path.join(base_dir, "train")
val_dir = os.path.join(base_dir, "val")

# Parámetros
batch_size = 32
img_height = 224
img_width = 224

# Cargar datos de entrenamiento y validación
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    train_dir,
    validation_split=None,  # si no está separado, no uses validation_split aquí
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    val_dir,
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size
)

# Opcional: Aumentar el rendimiento
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

# Crear un modelo simple (Ej: MobileNetV2 preentrenada)
base_model = tf.keras.applications.MobileNetV2(input_shape=(img_height, img_width, 3),
                                               include_top=False,
                                               weights='imagenet')
base_model.trainable = False  # Congelar capa base

global_average_layer = tf.keras.layers.GlobalAveragePooling2D()
prediction_layer = tf.keras.layers.Dense(1, activation='sigmoid')  # salida binaria

model = tf.keras.Sequential([
    base_model,
    global_average_layer,
    prediction_layer
])

model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
              loss='binary_crossentropy',
              metrics=['accuracy'])

# Entrenar
epochs = 5
history = model.fit(train_ds, validation_data=val_ds, epochs=epochs)

# Guardar el modelo
model.save('model.h5')  # Guarda en formato H5
# O también puedes guardar en formato SavedModel:
# model.save('saved_model/')  
