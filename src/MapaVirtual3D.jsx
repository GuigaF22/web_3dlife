import React, { useState, useEffect, useCallback, useRef } from "react";
import "./MapaVirtual3D.css";

const TILE_METERS = 256; // cada quadrado do grid = 256m

const MapaVirtual3D = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cellSize, setCellSize] = useState(40); // px por tile de 256m
  const [viewportX, setViewportX] = useState(0);
  const [viewportY, setViewportY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, viewX: 0, viewY: 0 });

  const [selectedRegion, setSelectedRegion] = useState(null);

  // Modal de aluguel
  const [rentModal, setRentModal] = useState({ open: false, x: null, y: null });
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    obs: "",
    tamanho: "256x256",
    prims: ""
  });

  // Buscar regiões (via PHP)
  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/opensim/check_api.php?type=regions");
      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
      const data = await res.json();
      setRegions(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && viewportX === 0 && viewportY === 0) {
        recenter(data, cellSize);
      }
    } catch (err) {
      setError(`Falha ao conectar: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cellSize, viewportX, viewportY]);

  useEffect(() => {
    fetchRegions();
    const i = setInterval(fetchRegions, 60000);
    return () => clearInterval(i);
  }, [fetchRegions]);

  // Centralizar
  const recenter = useCallback((list = regions, size = cellSize) => {
    if (!list || list.length === 0) return;
    const avgX = list.reduce((s, r) => s + r.locX / TILE_METERS, 0) / list.length;
    const avgY = list.reduce((s, r) => s + r.locY / TILE_METERS, 0) / list.length;
    const centerX = avgX * size;
    const centerY = avgY * size;
    setViewportX(centerX - window.innerWidth / 2);
    setViewportY(centerY - window.innerHeight / 2);
  }, [regions, cellSize]);

  // Zoom
  const zoomIn  = () => setCellSize(p => Math.min(p + 15, 120));
  const zoomOut = () => setCellSize(p => Math.max(p - 15, 20));
  const resetZoom = () => setCellSize(40);

  // Pan
  const handleMouseDown = e => {
    if (
      e.target.id === "map" ||
      e.target.classList.contains("grid-cell") ||
      e.target.classList.contains("region-block")
    ) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY, viewX: viewportX, viewY: viewportY };
    }
  };
  const handleMouseMove = e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setViewportX(dragStartRef.current.viewX - dx);
    setViewportY(dragStartRef.current.viewY - dy);
  };
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // Renderizar grid + regiões (desenha o bloco somente no tile de origem da região)
  const renderMap = () => {
    if (!regions || regions.length === 0) return null;

    const minX = Math.min(...regions.map(r => r.locX / TILE_METERS)) - 1;
    const maxX = Math.max(...regions.map(r => r.locX / TILE_METERS)) + 1;
    const minY = Math.min(...regions.map(r => r.locY / TILE_METERS)) - 1;
    const maxY = Math.max(...regions.map(r => r.locY / TILE_METERS)) + 1;

    const cells = [];
    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const covering = regions.find(r => {
          const startX = r.locX / TILE_METERS;
          const startY = r.locY / TILE_METERS;
          const endX = startX + r.sizeX / TILE_METERS - 1;
          const endY = startY + r.sizeY / TILE_METERS - 1;
          return gx >= startX && gx <= endX && gy >= startY && gy <= endY;
        });

        const x = gx * cellSize - viewportX;
        const y = gy * cellSize - viewportY;

        if (covering) {
          const startX = covering.locX / TILE_METERS;
          const startY = covering.locY / TILE_METERS;
          const isOrigin = gx === startX && gy === startY;
          if (isOrigin) {
            const isOnline = (covering.status || "").toLowerCase() === "online";
            const w = cellSize * (covering.sizeX / TILE_METERS);
            const h = cellSize * (covering.sizeY / TILE_METERS);
            cells.push(
              <div
                key={`region-${covering.regionUUID}`}
                className="region-block"
                style={{
                  left: x, top: y, width: w, height: h,
                  backgroundColor: isOnline ? "#00cc00" : "#cc3333"
                }}
                title={`${covering.regionName} • ${isOnline ? "Online" : "Offline"}`}
                onClick={() => setSelectedRegion(covering)}
              >
                <span className="region-label">{covering.regionName}</span>
              </div>
            );
          }
        } else {
          cells.push(
            <div
              key={`empty-${gx}-${gy}`}
              className="grid-cell"
              style={{ left: x, top: y, width: cellSize, height: cellSize }}
              title={`Coordenadas: ${gx},${gy}`}
              onClick={() => setRentModal({ open: true, x: gx, y: gy })}
            />
          );
        }
      }
    }
    return cells;
  };

  // Enviar pedido de aluguel
  const handleRentSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch("/api/opensim/rent.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: rentModal.x,
          y: rentModal.y,
          nome: formData.nome,
          email: formData.email,
          obs: formData.obs,
          tamanho: formData.tamanho,
          prims: formData.prims
        })
      });
      if (response.ok) {
        alert("📩 Pedido enviado! Em até 24 horas entraremos em contato.");
        setRentModal({ open: false, x: null, y: null });
        setFormData({ nome: "", email: "", obs: "", tamanho: "256x256", prims: "" });
      } else {
        const t = await response.text();
        alert("Erro ao enviar pedido: " + t);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const onlineCount  = regions.filter(r => (r.status || "").toLowerCase() === "online").length;
  const offlineCount = regions.length - onlineCount;

  if (loading) return <div>Carregando...</div>;
  if (error)   return <div>❌ {error}</div>;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background:"#0a0a0a" }}>
      {/* Controles */}
      <div className="map-controls">
        <button className="control-btn" onClick={zoomIn}>🔍+</button>
        <button className="control-btn" onClick={zoomOut}>🔍-</button>
        <button className="control-btn" onClick={resetZoom}>Reset</button>
        <button className="control-btn" onClick={() => recenter()}>🎯 Centralizar</button>
        <button className="control-btn" onClick={fetchRegions}>🔄 Atualizar</button>
      </div>

      {/* Resumo topo esquerdo */}
      <div className="stats mini-summary" style={{ top: 20, left: 20 }}>
        <div><span className="stat-label">Grid:</span> 3D Life Virtual</div>
        <div><span className="stat-label">Regiões:</span> {regions.length}</div>
        <div><span className="stat-label">Online:</span> {onlineCount}</div>
        <div><span className="stat-label">Zoom:</span> {Math.round((cellSize/40)*100)}%</div>
      </div>

      {/* Painel compacto de status */}
      <div className="stats status-panel">
        <div className="status-header">Status do Grid</div>
        <div className="status-meta">
          <span className="dot on" /> {onlineCount} online
          <span className="separator">•</span>
          <span className="dot off" /> {offlineCount} offline
        </div>

        <div className="status-list">
          {regions.map(r => {
            const isOn = (r.status || "").toLowerCase() === "online";
            return (
              <button
                key={r.regionUUID}
                className={`region-row ${isOn ? "on" : "off"}`}
                onClick={() => setSelectedRegion(r)}
                title={`${r.regionName} • ${isOn ? "Online" : "Offline"}`}
              >
                <span className={`dot ${isOn ? "on" : "off"}`} />
                <span className="region-title">{r.regionName}</span>
                <span className="region-coords">
                  {r.locX / TILE_METERS},{r.locY / TILE_METERS}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mapa */}
      <div
        id="map"
        onMouseDown={handleMouseDown}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "hidden"
        }}
      >
        {renderMap()}
      </div>

      {/* Painel da região selecionada */}
      {selectedRegion && (
        <div className="stats region-panel">
          <button className="close-btn" onClick={() => setSelectedRegion(null)}>✖</button>
          <h3>{selectedRegion.regionName}</h3>
          <div><b>Status:</b> {(selectedRegion.status||"").toLowerCase() === "online" ? "🟢 Online" : "🔴 Offline"}</div>
          <div><b>Coordenadas:</b> {selectedRegion.locX/TILE_METERS}, {selectedRegion.locY/TILE_METERS}</div>

          {(selectedRegion.status||"").toLowerCase() === "online" && (
            <button
              className="teleport-btn"
              onClick={() => {
                if (window.confirm("Abrir Firestorm e teleportar?")) {
                  const coords = `${Math.floor(selectedRegion.sizeX/2)}/${Math.floor(selectedRegion.sizeY/2)}/25`;
                  window.location.href = `hop://${selectedRegion.regionName}/${coords}`;
                }
              }}
            >
              🚀 Teleportar (Firestorm)
            </button>
          )}
        </div>
      )}

      {/* Modal de aluguel */}
      {rentModal.open && (
        <div className="rent-modal-overlay">
          <div className="rent-modal">
            <button className="close-btn" onClick={() => setRentModal({ open: false, x: null, y: null })}>✖</button>
            <h2>📌 Alugar região</h2>
            <p>Coordenadas: {rentModal.x}, {rentModal.y}</p>
            <form onSubmit={handleRentSubmit}>
              <input type="text" placeholder="Seu nome" value={formData.nome} required
                onChange={e => setFormData({ ...formData, nome: e.target.value })} />
              <input type="email" placeholder="Seu email" value={formData.email} required
                onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <select value={formData.tamanho} onChange={e => setFormData({ ...formData, tamanho: e.target.value })}>
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
              </select>
              <input type="number" placeholder="Quantidade de prims" value={formData.prims} required
                onChange={e => setFormData({ ...formData, prims: e.target.value })} />
              <textarea placeholder="Observações" value={formData.obs}
                onChange={e => setFormData({ ...formData, obs: e.target.value })} />
              <div className="modal-actions">
                <button type="button" onClick={() => setRentModal({ open: false, x: null, y: null })}>❌ Cancelar</button>
                <button type="submit">📩 Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaVirtual3D;
