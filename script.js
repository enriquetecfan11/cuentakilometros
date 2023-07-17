let map, prevLocation, totalDistance, isTracking;

function refreshPage() {
  location.reload();
  localStorage.clear();
}

// Función para inicializar el mapa y los botones
function initMap() {
  // Crea el mapa y lo centra en una ubicación predeterminada (por ejemplo, la ciudad de Nueva York)
  map = L.map('map').setView([40.7128, -74.0060], 13);

  // Agrega un mapa base (puedes elegir diferentes proveedores de mapas)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  // Inicializa las variables
  prevLocation = null;
  totalDistance = 0;
  isTracking = false;

  // Accede a la geolocalización del usuario
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateLocation);
  } else {
    alert('Tu navegador no admite la geolocalización.');
  }

  // Botones
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const shareBtn = document.getElementById('shareBtn');

  startBtn.addEventListener('click', startTracking);
  stopBtn.addEventListener('click', stopTracking);
  shareBtn.addEventListener('click', shareData);

  // Mostrar las rutas almacenadas localmente en la tabla
  displayRoutes();
}

// Función para iniciar el seguimiento de la ubicación
function startTracking() {
  isTracking = true;
  totalDistance = 0;
  document.getElementById('distance').innerText = '0.00 km';
}

// Función para detener el seguimiento de la ubicación
function stopTracking() {
  isTracking = false;
  document.getElementById('distance').innerText = '0.00 km';
  if (prevLocation && L.marker) {
    map.removeLayer(prevLocation);
    prevLocation = null;
  }
}

// Función para actualizar la ubicación y calcular la distancia
function updateLocation(position) {
  const { latitude, longitude } = position.coords;
  const currentLocation = L.latLng(latitude, longitude);

  // Si tenemos una ubicación anterior, calculamos la distancia recorrida
  if (prevLocation && isTracking) {
    const distance = currentLocation.distanceTo(prevLocation);
    totalDistance += distance / 1000; 
    document.getElementById('distance').innerText = totalDistance.toFixed(2) + ' km';

    // Guardar la nueva ubicación en el almacenamiento local como una ruta con un ID único
    const route = {
      id: Date.now(), // Generar un ID único basado en la marca de tiempo actual
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      distance: totalDistance.toFixed(2) // Agregar la distancia total de la ruta
    };

    // Obtener las rutas almacenadas localmente
    const routes = getRoutesFromLocalStorage();
    routes.push(route);

    // Guardar las rutas actualizadas en el almacenamiento local
    localStorage.setItem('rutas', JSON.stringify(routes));
  }

  prevLocation = currentLocation;

  // Mueve el marcador del usuario a la nueva ubicación
  if (!L.marker) {
    L.marker(currentLocation).addTo(map);
  } else {
    L.marker(currentLocation).addTo(map).setLatLng(currentLocation);
  }

  map.setView(currentLocation, 13);

  // Actualizar la tabla de rutas para mostrar las rutas almacenadas localmente
  displayRoutes();
}

// Función para mostrar las rutas en la tabla
function displayRoutes() {
  // Obtener las rutas almacenadas localmente
  const routes = getRoutesFromLocalStorage();

  // Obtener la referencia al cuerpo de la tabla
  const tableBody = document.querySelector('#routesTable tbody');

  // Limpiar la tabla antes de mostrar las rutas para evitar duplicados
  tableBody.innerHTML = '';

  // Recorrer las rutas y agregar una fila por cada una
  routes.forEach((route) => {
    const row = tableBody.insertRow();


    const date = new Date(route.id);
    const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    
    const dateCell = row.insertCell();
    dateCell.textContent = dateString;
    
    // const latitudeCell = row.insertCell();
    // latitudeCell.textContent = route.latitude; 
    // const longitudeCell = row.insertCell();
    // longitudeCell.textContent = route.longitude;
    
    const distanceCell = row.insertCell();
    distanceCell.textContent = route.distance + ' km';
  });

  // Mostrar la tabla si hay rutas disponibles, ocultarla si no hay rutas
  const routesTable = document.getElementById('routesTable');
  routesTable.style.display = routes.length > 0 ? 'table' : 'none';
}

// Función para compartir los datos almacenados localmente
function shareData() {
  const dataToShare = JSON.stringify({ routes: getRoutesFromLocalStorage() });
  const blob = new Blob([dataToShare], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'mi_ruta.json';
  link.click();

  // Limpiar la URL creada después de que el usuario descargue el archivo
  URL.revokeObjectURL(url);

  // Reiniciar la distancia total y actualizar la visualización
  totalDistance = 0;
  document.getElementById('distance').innerText = '0.00 km';

  // También puedes borrar el marcador del mapa y la ubicación anterior si lo deseas
  if (prevLocation && L.marker) {
    map.removeLayer(prevLocation);
    prevLocation = null;
  }
}

// Función para obtener las rutas almacenadas localmente
function getRoutesFromLocalStorage() {
  return JSON.parse(localStorage.getItem('rutas')) || [];
}



document.addEventListener('DOMContentLoaded', initMap);

const refreshBtn = document.getElementById('refreshBtn');
refreshBtn.addEventListener('click', refreshPage);
