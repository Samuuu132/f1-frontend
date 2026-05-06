const API_URL = 'https://backend-8xza.onrender.com/drivers';
const form = document.getElementById('driver-form');
const driversList = document.getElementById('drivers-list');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

document.addEventListener('DOMContentLoaded', fetchDrivers);

// Función para convertir la imagen subida a texto (Base64)
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Obtener todos los pilotos
async function fetchDrivers() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        renderDrivers(result.data);
    } catch (error) {
        console.error('Error al cargar los pilotos:', error);
    }
}

// Renderizar las tarjetas
function renderDrivers(drivers) {
    driversList.innerHTML = '';
    drivers.forEach(driver => {
        const card = document.createElement('div');
        card.className = 'driver-card';
        card.innerHTML = `
            ${driver.imagen ? `<img src="${driver.imagen}" alt="${driver.nombre}">` : '<div style="height: 200px; background: #1e1e24; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; border-radius: 4px; color: #666;">Sin foto</div>'}
            <h3>${driver.numero} - ${driver.nombre}</h3>
            <div class="driver-info">
                <p>Escudería: <span>${driver.equipo}</span></p>
                <p>Nacionalidad: <span>${driver.nacionalidad}</span></p>
            </div>
            <div class="card-actions">
                <button class="btn-edit" onclick="editDriver(${driver.id}, '${driver.nombre}', '${driver.equipo}', '${driver.nacionalidad}', ${driver.numero}, '${driver.imagen || ''}')">Editar</button>
                <button class="btn-delete" onclick="deleteDriver(${driver.id})">Borrar</button>
            </div>
        `;
        driversList.appendChild(card);
    });
}

// Guardar o Actualizar piloto
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('driver-id').value;
    const fileInput = document.getElementById('imagen');
    let base64Image = document.getElementById('imagen-actual').value || null;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > 1048576) {
            alert('¡La imagen es muy pesada! Debe ser menor a 1MB.');
            return;
        }
        base64Image = await getBase64(file);
    }

    const driverData = {
        nombre: document.getElementById('nombre').value,
        equipo: document.getElementById('equipo').value,
        nacionalidad: document.getElementById('nacionalidad').value,
        numero: parseInt(document.getElementById('numero').value),
        imagen: base64Image
    };

    try {
        if (id) {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(driverData)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(driverData)
            });
        }

        // Limpiar formulario
        form.reset();
        document.getElementById('driver-id').value = '';
        document.getElementById('imagen-actual').value = '';
        formTitle.textContent = 'Añadir Piloto';
        submitBtn.textContent = 'Guardar Piloto';
        // Resetear label
        document.querySelector('label[for="imagen"]').textContent = 'Foto del piloto (máx. 1MB)';
        fetchDrivers();
    } catch (error) {
        console.error('Error al guardar el piloto:', error);
    }
});

// Preparar formulario para edición
function editDriver(id, nombre, equipo, nacionalidad, numero, imagen) {
    document.getElementById('driver-id').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('equipo').value = equipo;
    document.getElementById('nacionalidad').value = nacionalidad;
    document.getElementById('numero').value = numero;
    document.getElementById('imagen-actual').value = imagen;
    document.getElementById('imagen').value = '';

    // Mostrar si ya tiene foto guardada
    const label = document.querySelector('label[for="imagen"]');
    if (imagen) {
        label.textContent = '✅ Ya tiene foto guardada. Elige otra para cambiarla:';
    } else {
        label.textContent = 'Foto del piloto (máx. 1MB)';
    }

    formTitle.textContent = 'Editar Piloto';
    submitBtn.textContent = 'Actualizar Datos';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Borrar piloto
async function deleteDriver(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este piloto del registro?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchDrivers();
        } catch (error) {
            console.error('Error al borrar:', error);
        }
    }
}