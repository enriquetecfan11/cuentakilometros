// Variables globales para almacenar datos
let map, prevLocation, totalDistance, isTracking;

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
  const notificationCheckbox = document.getElementById('notificationCheckbox');

  startBtn.addEventListener('click', startTracking);
  stopBtn.addEventListener('click', stopTracking);
  shareBtn.addEventListener('click', shareData);
  notificationCheckbox.addEventListener('change', saveNotificationPreference);

  // Cargar la preferencia de notificaciones desde el almacenamiento local
  loadNotificationPreference();
}

// Función para iniciar el seguimiento de la ubicación
function startTracking() {
  isTracking = true;
  document.getElementById('distance').innerText = '0.00 km';
}

// Función para detener el seguimiento de la ubicación
function stopTracking() {
  isTracking = false;
}

// Función para actualizar la ubicación y calcular la distancia
function updateLocation(position) {
  const { latitude, longitude } = position.coords;
  const currentLocation = L.latLng(latitude, longitude);

  // Si tenemos una ubicación anterior, calculamos la distancia recorrida
  if (prevLocation && isTracking) {
    const distance = currentLocation.distanceTo(prevLocation); // En metros
    totalDistance += distance / 1000; // Convertimos a kilómetros
    document.getElementById('distance').innerText = totalDistance.toFixed(2) + ' km';
  }

  // Actualizamos la ubicación anterior
  prevLocation = currentLocation;

  // Mueve el marcador del usuario a la nueva ubicación
  if (!L.marker) {
    L.marker(currentLocation).addTo(map);
  } else {
    L.marker(currentLocation).addTo(map).setLatLng(currentLocation);
  }

  // Centramos el mapa en la nueva ubicación
  map.setView(currentLocation, 13);
}

// Función para guardar la preferencia de notificaciones en el almacenamiento local
function saveNotificationPreference() {
  const notificationCheckbox = document.getElementById('notificationCheckbox');
  const preference = notificationCheckbox.checked;
  localStorage.setItem('notificationPreference', JSON.stringify(preference));
}

// Función para cargar la preferencia de notificaciones desde el almacenamiento local
function loadNotificationPreference() {
  const notificationCheckbox = document.getElementById('notificationCheckbox');
  const preference = JSON.parse(localStorage.getItem('notificationPreference')) || false;
  notificationCheckbox.checked = preference;
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
}

// Obtener las rutas almacenadas localmente
function getRoutesFromLocalStorage() {
  return JSON.parse(localStorage.getItem('rutas')) || [];
}

// Inicializar el mapa cuando se cargue la página
document.addEventListener('DOMContentLoaded', initMap);
