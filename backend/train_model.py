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
    image_size=(img_height, img_width),
    batch_size=batch_size,
    seed=123
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    val_dir,
    image_size=(img_height, img_width),
    batch_size=batch_size,
    seed=123
)

# Preprocesamiento consistente: mapear preprocess_input a los datasets
def preprocess(image, label):
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    return image, label

train_ds = train_ds.map(preprocess)
val_ds = val_ds.map(preprocess)

AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

# Crear el modelo base con MobileNetV2 preentrenada
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(img_height, img_width, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False  # Congelamos las capas base

global_average_layer = tf.keras.layers.GlobalAveragePooling2D()
prediction_layer = tf.keras.layers.Dense(1, activation='sigmoid')  # Para clasificación binaria

model = tf.keras.Sequential([
    base_model,
    global_average_layer,
    prediction_layer
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

epochs = 20
history = model.fit(train_ds, validation_data=val_ds, epochs=epochs)

model.save('model.h5')
