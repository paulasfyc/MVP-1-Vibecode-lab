"use client";

import { useState } from 'react';
import { MapPin, Navigation, Plus, Minus, Box, User, Phone, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';

export default function VibeCargoQuote() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    stairs: 0,
    items: '',
    clientName: '',
    phone: '',
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [quoteResult, setQuoteResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateStairs = (amount) => {
    setFormData((prev) => ({
      ...prev,
      stairs: Math.max(0, prev.stairs + amount),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con el servidor.');
      }

      setQuoteResult(data);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error.message || 'Ocurrió un error inesperado al procesar la cotización.');
      setStatus('error');
    }
  };

  const formatCLP = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleWhatsApp = () => {
    if (!quoteResult) return;
    const text = `¡Hola! Me gustaría confirmar mi cotización con VibeCargo.\n\nOrigen: ${formData.origin}\nDestino: ${formData.destination}\nTotal Estimado: ${formatCLP(quoteResult.estimated_total)}\n\n¿Podemos coordinar?`;
    const whatsappUrl = `https://wa.me/56900000000?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Hero Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold animate-pulse">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Cotizador IA en Vivo
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          VibeCargo
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg">
          Calcula el costo de tu mudanza o flete de manera inteligente, rápida y precisa.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Box className="text-indigo-500" /> Detalles del Servicio
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Direcciones */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección de Origen</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="origin"
                      required
                      value={formData.origin}
                      onChange={handleInputChange}
                      placeholder="Ej. Av. Providencia 1234"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección de Destino</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="destination"
                      required
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Ej. Las Condes 5678"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Pisos por escalera */}
              <div>
                <label className="block text-sm font-medium mb-2">Pisos por escalera (sin ascensor)</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateStairs(-1)}
                    className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-semibold w-8 text-center">{formData.stairs}</span>
                  <button
                    type="button"
                    onClick={() => updateStairs(1)}
                    className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Ítems */}
              <div>
                <label className="block text-sm font-medium mb-2">Descripción de Muebles / Ítems</label>
                <textarea
                  name="items"
                  required
                  rows="4"
                  value={formData.items}
                  onChange={handleInputChange}
                  placeholder="Ej. 1 refrigerador, 1 sofá de 3 cuerpos, 4 cajas medianas..."
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Datos de contacto (Opcional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre (Opcional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Tu nombre"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono (Opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+56 9 0000 0000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {status === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || !formData.origin || !formData.destination || !formData.items}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Calculando costos con Gemini... ⏳
                  </>
                ) : (
                  <>Calcular Cotización con IA 🚀</>
                )}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Resultados */}
          <div className="h-full">
            {status === 'idle' && !quoteResult && (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-slate-400">
                <Box className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Ingresa los detalles para generar tu cotización</p>
                <p className="text-sm mt-2 opacity-70">Nuestra IA analizará la ruta y volumen en segundos.</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
                <div className="space-y-4 mb-8">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                </div>
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl w-full mb-6"></div>
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
              </div>
            )}

            {quoteResult && status !== 'loading' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CheckCircle2 className="w-32 h-32 text-indigo-500" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                    <CheckCircle2 className="w-5 h-5" /> Cotización Generada
                  </div>
                  <h3 className="text-xl font-bold mb-6">Desglose de Costos</h3>

                  <div className="space-y-3 mb-8">
                    {quoteResult.breakdown?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <span className="text-slate-600 dark:text-slate-300">{item.description}</span>
                        <span className="font-semibold">{formatCLP(item.cost)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl mb-8 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Precio Final Estimado</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">(Incluye impuestos y peajes)</p>
                    </div>
                    <span className="text-3xl md:text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">
                      {formatCLP(quoteResult.estimated_total)}
                    </span>
                  </div>

                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-lg shadow-lg shadow-green-200 dark:shadow-none transition-colors flex justify-center items-center gap-2"
                  >
                    <Send className="w-5 h-5" /> Compartir por WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
