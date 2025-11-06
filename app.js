// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCamera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('gallery');
const galleryScroll = document.getElementById('galleryScroll');
const photoCount = document.getElementById('photoCount');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

let stream = null;
let currentFacingMode = 'environment';
let photos = [];



function updateGallery() {
    galleryScroll.innerHTML = '';
    photoCount.textContent = photos.length;

    if (photos.length > 0) {
        gallery.classList.add('visible');
        photos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = photo.data;
            img.alt = `Foto ${index + 1}`;

            // Clic para ver imagen completa
            img.addEventListener('click', () => showModal(photo.data));

            item.appendChild(img);
            galleryScroll.appendChild(item);
        });
    } else {
        gallery.classList.remove('visible');
    }
}

/** Mostrar modal con imagen completa */
function showModal(imageData) {
    modalImage.src = imageData;
    modal.classList.add('visible');
}

/** Cerrar modal */
function closeModal() {
    modal.classList.remove('visible');
}

/** Abrir cámara */
async function openCamera() {
    try {
        if (stream) closeCamera();

        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode },
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara abierta';
        openCameraBtn.disabled = true;

        console.log('Cámara abierta exitosamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
}

/** Cambiar entre cámara frontal y trasera */
async function switchCamera() {
    try {
        // 🔹 Cierra la cámara actual antes de cambiar
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        // 🔹 Cambia entre cámara frontal y trasera
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

        // 🔹 Vuelve a abrir la cámara con el nuevo modo
        await openCamera();

        console.log(`Cambiando a cámara: ${currentFacingMode}`);
    } catch (error) {
        console.error('Error al cambiar de cámara:', error);
        alert('No se pudo cambiar de cámara. Verifica los permisos o tu dispositivo.');
    }
}


function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // Configurar tamaño del canvas igual al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir la imagen a Base64 (JPEG)
    const imageDataURL = canvas.toDataURL('image/jpeg', 0.6);

    // Verificar que el valor no esté vacío
    if (!imageDataURL || !imageDataURL.startsWith('data:image')) {
        console.error('Error: no se generó la imagen Base64 correctamente.');
        return;
    }

    // ✅ Mostrar en consola la cadena Base64
    console.log('Imagen capturada en Base64:');
    console.dir(imageDataURL);

    
    console.log('Longitud del string Base64:', imageDataURL.length);

  
    const newPhoto = {
        id: Date.now(),
        data: imageDataURL,
        timestamp: new Date().toISOString()
    };

    photos.unshift(newPhoto);
    updateGallery();

    console.log('Foto agregada a la galería:', photos.length, 'total');

    setTimeout(() => {
        galleryScroll.scrollTo({ left: 0, behavior: 'smooth' });
    }, 100);
}

/** Cerrar cámara */
function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
        cameraContainer.style.display = 'none';
        openCameraBtn.textContent = 'Abrir cámara';
        openCameraBtn.disabled = false;
        console.log('Cámara cerrada');
    }
}

// Event listeners
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
switchCameraBtn.addEventListener('click', switchCamera);
modalClose.addEventListener('click', closeModal);

// Cerrar modal al hacer clic fuera de la imagen
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

window.addEventListener('beforeunload', closeCamera);

