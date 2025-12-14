import React from 'react';
import { Calculator, TrendingUp, Dumbbell, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const HelpView: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto w-full">
      <header className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Guía de Conceptos</h1>
      </header>

      <div className="space-y-6">
        
        {/* Concepto 1: e1RM */}
        <section className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center space-x-3 mb-3 text-blue-400">
            <Calculator size={24} />
            <h2 className="font-bold text-lg">¿Qué es el e1RM?</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            El <strong>e1RM</strong> significa <em>"Estimated 1 Rep Max"</em> (Repetición Máxima Estimada). 
            Es un número teórico que representa el peso máximo que podrías levantar a <strong>1 sola repetición</strong>, 
            calculado en base al peso y repeticiones que hiciste en tu serie.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Por qué es útil:</h3>
            <p className="text-slate-400 text-xs italic">
              "Te permite comparar si fuiste más fuerte hoy haciendo 80kg x 8 reps, o la semana pasada haciendo 90kg x 3 reps."
            </p>
          </div>
          <div className="text-xs text-slate-500">
            <span className="font-mono bg-slate-700 px-1 py-0.5 rounded text-slate-300">Fórmula Epley: Peso * (1 + Reps/30)</span>
          </div>
        </section>

        {/* Concepto 2: Progreso */}
        <section className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center space-x-3 mb-3 text-green-400">
            <TrendingUp size={24} />
            <h2 className="font-bold text-lg">¿Cómo mido mi progreso?</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            No te fijes solo en si subes el peso. Si subes las repeticiones con el mismo peso, tu <strong>e1RM subirá</strong>, 
            lo que indica que te has vuelto más fuerte.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2 text-sm text-slate-300">
              <span className="text-green-500 font-bold">↗</span>
              <span><strong>Mejorando:</strong> Tu e1RM actual es mayor que el promedio de tus últimas 2 sesiones.</span>
            </li>
             <li className="flex items-start space-x-2 text-sm text-slate-300">
              <span className="text-blue-500 font-bold">-</span>
              <span><strong>Estable:</strong> Te mantienes dentro de un margen del 2% de tu rendimiento habitual.</span>
            </li>
          </ul>
        </section>

        {/* Concepto 3: Registro */}
        <section className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center space-x-3 mb-3 text-purple-400">
            <Dumbbell size={24} />
            <h2 className="font-bold text-lg">Consejos de Registro</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
             <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <h4 className="font-bold text-white text-sm mb-1">Elige tu unidad</h4>
                <p className="text-xs text-slate-400">
                    Puedes cambiar entre KG y LB en cualquier momento desde tu Perfil o directamente en el botón superior al registrar un entreno. La app convierte todo automáticamente.
                </p>
             </div>
             <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <h4 className="font-bold text-white text-sm mb-1">Historial Automático</h4>
                <p className="text-xs text-slate-400">
                    Al seleccionar un ejercicio, la app rellenará el peso y repeticiones que usaste la última vez para que solo tengas que ajustar lo que cambiaste.
                </p>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};