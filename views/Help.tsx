import React, { useState } from 'react';
import { TrendingUp, Dumbbell, ArrowLeft, BarChart3, Zap, Info, Calculator, Target, Trophy, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Unit } from '../types';

interface Props {
  onBack: () => void;
  unit?: Unit;
}

export const HelpView: React.FC<Props> = ({ onBack, unit = 'kg' }) => {
  const [showTechInfo, setShowTechInfo] = useState(false);

  return (
    <div className="pb-24 pt-6 px-4 max-w-3xl mx-auto w-full">
      <header className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Guía Completa</h1>
          <p className="text-sm text-slate-400 mt-1">Todo lo que necesitas saber para aprovechar la app al máximo</p>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Concepto 1: e1RM */}
        <section className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-6 border border-blue-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-blue-400">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h2 className="font-bold text-xl">¿Qué es el e1RM?</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            El <strong className="text-blue-400">e1RM</strong> significa <em>"Estimated 1 Rep Max"</em> (Repetición Máxima Estimada). 
            Es un número que representa el peso máximo teórico que podrías levantar a <strong>1 sola repetición</strong>, 
            calculado automáticamente con base al peso y repeticiones de tus series.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <Info size={14} />
              ¿Por qué es útil?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Te permite comparar entrenamientos diferentes. Por ejemplo: ¿Fuiste más fuerte haciendo 
              <span className="text-green-400 font-semibold"> 80kg × 8 reps</span> hoy, o 
              <span className="text-green-400 font-semibold"> 90kg × 3 reps</span> la semana pasada? 
              El e1RM te da la respuesta al instante.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 px-3 py-2 rounded-lg">
            <Calculator size={14} className="text-blue-400" />
            <span className="font-mono text-slate-300">Fórmula Epley: Peso × (1 + Reps ÷ 30)</span>
          </div>
        </section>

        {/* Concepto 2: RIR y RPE */}
        <section className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-6 border border-purple-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-purple-400">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap size={24} />
            </div>
            <h2 className="font-bold text-xl">RIR y RPE: Intensidad de tus series</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h3 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                <Target size={16} />
                RIR (Reps en Reserva)
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                Cuántas repeticiones podrías haber hecho <strong>antes de llegar al fallo</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-900/20 border border-green-700/30 p-2 rounded">
                  <span className="text-green-400 font-bold">RIR 3-4:</span>
                  <span className="text-slate-400"> Moderado, bueno para volumen</span>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/30 p-2 rounded">
                  <span className="text-yellow-400 font-bold">RIR 1-2:</span>
                  <span className="text-slate-400"> Intenso, cerca del fallo</span>
                </div>
                <div className="bg-red-900/20 border border-red-700/30 p-2 rounded">
                  <span className="text-red-400 font-bold">RIR 0:</span>
                  <span className="text-slate-400"> Fallo muscular total</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h3 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                <BarChart3 size={16} />
                RPE (Esfuerzo Percibido)
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                Del 1 al 10, qué tan difícil fue la serie. <strong>RPE 10 = Fallo total</strong>.
              </p>
              <p className="text-xs text-slate-400 italic">
                💡 Tip: RIR y RPE están relacionados. RPE 8 ≈ RIR 2 (podrías hacer 2 reps más)
              </p>
            </div>
          </div>
        </section>

        {/* Concepto 3: Progreso */}
        <section className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl p-6 border border-green-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-green-400">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Trophy size={24} />
            </div>
            <h2 className="font-bold text-xl">¿Cómo mido mi progreso?</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            El progreso <strong>no es solo subir peso</strong>. Si aumentas repeticiones con el mismo peso, 
            tu <strong className="text-green-400">e1RM también sube</strong>, indicando que te has vuelto más fuerte.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-green-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">↗️</span>
                <span className="text-green-400 font-bold text-sm">MEJORANDO</span>
              </div>
              <p className="text-xs text-slate-300">
                Tu e1RM actual es mayor que el promedio de tus últimas 2 sesiones
              </p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">➡️</span>
                <span className="text-blue-400 font-bold text-sm">ESTABLE</span>
              </div>
              <p className="text-xs text-slate-300">
                Te mantienes dentro de un margen del 2% de tu rendimiento habitual
              </p>
            </div>
          </div>
        </section>

        {/* Concepto 4: Consejos de Registro */}
        <section className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 rounded-xl p-6 border border-amber-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-amber-400">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Dumbbell size={24} />
            </div>
            <h2 className="font-bold text-xl">Consejos para Registrar</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                Unidades de Peso
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                Cambia entre <strong>KG</strong> y <strong>LB</strong> desde tu Perfil o usando el botón en la pantalla de registro.
              </p>
              <p className="text-xs text-slate-400 italic">
                La app convierte todo automáticamente, no te preocupes por hacer cálculos.
              </p>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <Clock size={16} />
                Historial Automático
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                Al seleccionar un ejercicio, se auto-completan el peso y reps de tu última sesión.
              </p>
              <p className="text-xs text-slate-400 italic">
                Solo ajusta lo que cambió. ¡Ahorra tiempo!
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">📊</span>
                Análisis por Timeframe
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                Visualiza tus estadísticas por <strong>día, semana, mes o año</strong>.
              </p>
              <p className="text-xs text-slate-400 italic">
                Haz clic en cualquier ejercicio de la página de inicio para ver su modal de análisis.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <Calculator size={16} />
                Calculadora e1RM
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                Usa la <strong>Calculadora</strong> del sidebar para estimar tu máximo sin entrenar.
              </p>
              <p className="text-xs text-slate-400 italic">
                Ingresa peso, reps y RIR para obtener predicciones precisas.
              </p>
            </div>
          </div>
        </section>

        {/* Datos Técnicos - Colapsable */}
        <div className="border-t border-slate-700 pt-4">
          <button
            onClick={() => setShowTechInfo(!showTechInfo)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors mx-auto"
          >
            <Info size={16} />
            <span>Información Técnica</span>
            {showTechInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showTechInfo && (
            <div className="mt-4 bg-slate-800/50 rounded-xl p-5 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2 text-xs text-slate-400">
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong className="text-slate-300">Base de datos:</strong> Supabase (PostgreSQL) con sincronización local</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong className="text-slate-300">Cálculos:</strong> Fórmula Epley para e1RM, conversiones automáticas RIR ↔ RPE</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong className="text-slate-300">Privacidad:</strong> Tus datos están protegidos con Row Level Security (RLS)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong className="text-slate-300">Offline:</strong> Funciona sin conexión usando localStorage como caché</span>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};