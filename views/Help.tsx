import React, { useState } from 'react';
import { TrendingUp, Dumbbell, ArrowLeft, BarChart3, Zap, Info, Calculator, Target, Trophy, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
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
        
        {/* Sección: Introducción */}
        <section className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h2 className="font-bold text-xl text-white mb-4">¿Qué es GymProgress?</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            GymProgress es una <strong>app para registrar tus entrenamientos</strong>. Cada vez que levantes pesas, 
            registra: qué ejercicio hiciste, cuánto peso levantaste y cuántas repeticiones hiciste. 
            La app <strong>calcula automáticamente</strong> qué tan fuerte eres y <strong>te muestra gráficas</strong> para que veas tu progreso.
          </p>
          <div className="bg-blue-900/20 border border-blue-700/30 p-4 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Analogía:</strong> Es como un cuaderno inteligente de gimnasio que en lugar de solo guardar números, 
              te dice si estás mejorando, te calcula tu máximo teórico, y te motiva con gráficas de progreso.
            </p>
          </div>
        </section>

        {/* Concepto 1: e1RM - Mejorado */}
        <section className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-6 border border-blue-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-blue-400">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h2 className="font-bold text-xl">¿Qué es el e1RM? (Lo más importante)</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            El <strong className="text-blue-400">e1RM</strong> significa <em>"Estimated 1 Rep Max"</em> (Repetición Máxima Estimada). 
            Es un número que representa el peso máximo teórico que podrías levantar a <strong>1 sola repetición</strong>, 
            calculado automáticamente con base al peso y repeticiones de tus series.
          </p>
          
          <div className="space-y-3">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Ejemplo Real</h3>
              <p className="text-slate-300 text-sm mb-3">
                Hiciste <span className="text-green-400 font-bold">80 kg × 5 repeticiones</span> en press de banca.
              </p>
              <p className="text-slate-400 text-xs mb-2">La app calcula automáticamente: <span className="text-slate-300 font-mono">80 × (1 + 5÷30) = 93.3 kg</span></p>
              <p className="text-sm text-slate-300">
                Eso significa que tu <strong className="text-blue-400">e1RM es 93.3 kg</strong>. 
                Teóricamente, podrías levantar esa cantidad a 1 repetición (aunque no lo intentes 😄).
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-700/30">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Info size={14} />
                ¿Por qué importa?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Imagina que el lunes hiciste <span className="text-green-400 font-bold">80kg × 8 reps</span> (e1RM = 100kg) 
                y el viernes hiciste <span className="text-yellow-400 font-bold">90kg × 3 reps</span> (e1RM = 98kg). 
                <strong className="text-blue-400"> ¿Fuiste más fuerte?</strong> El e1RM te da la respuesta: 
                <span className="text-green-400"> SÍ, el lunes estuviste más fuerte</span>.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Casos de Uso</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong>Comparar progreso:</strong> ¿Estoy más fuerte que hace 4 semanas?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong>Motivación visual:</strong> Ver gráficas que suben te anima a seguir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong>Planificar entrenamientos:</strong> Si tu e1RM es 100kg, sabes qué peso usar</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Concepto 2: RIR y RPE - Mejorado */}
        <section className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-6 border border-purple-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-purple-400">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap size={24} />
            </div>
            <h2 className="font-bold text-xl">RIR y RPE: ¿Qué tan duro trabajaste?</h2>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            RIR y RPE son formas de medir <strong>cuán intenso fue tu entrenamiento</strong>. 
            No es lo mismo hacer 5 reps fácilmente que hacerlas con todo el esfuerzo.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-700/30">
              <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                <Target size={16} />
                RIR (Reps en Reserva) - Más fácil de usar
              </h3>
              <p className="text-slate-300 text-sm mb-3">
                <strong>¿Cuántas repeticiones más podrías haber hecho antes de fallar?</strong>
              </p>
              
              <div className="space-y-2 mb-3">
                <div className="bg-green-900/30 border border-green-700/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-green-300 font-bold">RIR 4-5:</span>
                    <span className="text-xs text-green-400">Fácil</span>
                  </div>
                  <p className="text-xs text-slate-300">Podrías hacer 4-5 reps más. Perfecto para calentamiento.</p>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-yellow-300 font-bold">RIR 2-3:</span>
                    <span className="text-xs text-yellow-400">Normal</span>
                  </div>
                  <p className="text-xs text-slate-300">Podrías hacer 2-3 reps más. El "punto dulce" para crecer músculo.</p>
                </div>

                <div className="bg-orange-900/30 border border-orange-700/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-orange-300 font-bold">RIR 0-1:</span>
                    <span className="text-xs text-orange-400">Muy intenso</span>
                  </div>
                  <p className="text-xs text-slate-300">Prácticamente en el fallo. Difícil, solo para ejercicios finales.</p>
                </div>

                <div className="bg-red-900/30 border border-red-700/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-300 font-bold">RIR 0 (Fallo):</span>
                    <span className="text-xs text-red-400">Máximo esfuerzo</span>
                  </div>
                  <p className="text-xs text-slate-300">No puedes hacer ni una rep más. Úsalo ocasionalmente.</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic bg-slate-800/50 p-2 rounded">
                💡 Si hiciste 8 reps y sentías que podrías hacer 2-3 más → <strong>RIR 2-3</strong>
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-purple-700/30">
              <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                <BarChart3 size={16} />
                RPE (Esfuerzo Percibido) - Escala 1-10
              </h3>
              <p className="text-slate-300 text-sm mb-3">
                <strong>¿Qué tan duro sentiste que fue, del 1 al 10?</strong>
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <span className="text-slate-400">RPE 5:</span> <span className="text-slate-300">Muy fácil</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">RPE 7:</span> <span className="text-slate-300">Normal</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">RPE 8-9:</span> <span className="text-slate-300">Difícil</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">RPE 10:</span> <span className="text-green-400 font-bold">Fallo total</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic mt-3 bg-slate-800/50 p-2 rounded">
                💡 RPE y RIR están conectados: RPE 8 ≈ RIR 2. Usa lo que te sea más fácil de recordar.
              </p>
            </div>
          </div>
        </section>

        {/* Concepto 3: Progreso - Mejorado */}
        <section className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl p-6 border border-green-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-green-400">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Trophy size={24} />
            </div>
            <h2 className="font-bold text-xl">¿Cómo sé que estoy progresando?</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            El progreso <strong>NO es solo subir peso</strong>. Hay muchas formas de mejorar. 
            Si aumentas repeticiones con el mismo peso, tu <strong className="text-green-400">e1RM también sube</strong>.
          </p>
          
          <div className="space-y-3 mb-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h3 className="text-sm font-bold text-green-300 mb-2">Formas de Progresar</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">1.</span>
                  <span><strong>Más peso:</strong> De 80kg a 85kg en press de banca ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">2.</span>
                  <span><strong>Más reps:</strong> De 80kg × 5 reps a 80kg × 8 reps ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">3.</span>
                  <span><strong>Menos esfuerzo:</strong> Mismo peso/reps pero con RIR 3 en lugar de RIR 1 ✓</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">4.</span>
                  <span><strong>Más volumen:</strong> Más series o ejercicios en el mismo tiempo ✓</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-green-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">↗️</span>
                  <span className="text-green-400 font-bold">MEJORANDO</span>
                </div>
                <p className="text-xs text-slate-300">
                  Tu e1RM actual es <strong>mayor</strong> que el promedio de tus últimas sesiones
                </p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">➡️</span>
                  <span className="text-blue-400 font-bold">ESTABLE</span>
                </div>
                <p className="text-xs text-slate-300">
                  Te mantienes dentro del mismo nivel (variación normal)
                </p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-red-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">↘️</span>
                  <span className="text-red-400 font-bold">BAJANDO</span>
                </div>
                <p className="text-xs text-slate-300">
                  Tu e1RM es <strong>menor</strong> que el promedio (descansa más)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Concepto 4: Consejos de Registro - Mejorado */}
        <section className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 rounded-xl p-6 border border-amber-700/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4 text-amber-400">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Dumbbell size={24} />
            </div>
            <h2 className="font-bold text-xl">Cómo Registrar tus Entrenamientos</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">1️⃣</span>
                Abre "Registrar Sesión"
              </h4>
              <p className="text-sm text-slate-300">
                Haz clic en el botón azul grande de "Entrenar" o el botón "Registrar Sesión" del sidebar.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">2️⃣</span>
                Selecciona el Ejercicio
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                Elige de la lista o <strong>crea uno nuevo</strong> si no existe.
              </p>
              <p className="text-xs text-slate-400 italic">
                💡 La app automáticamente sugiere el peso y reps de tu última sesión con ese ejercicio.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">3️⃣</span>
                Ingresa tus datos (Peso, Reps, RIR)
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                <strong>Peso:</strong> Cuántos kg/lb levantaste <br/>
                <strong>Reps:</strong> Cuántas repeticiones hiciste <br/>
                <strong>RIR:</strong> Cuántas reps más podrías haber hecho
              </p>
              <p className="text-xs text-slate-400 italic">
                💡 Usa los botones +/- para cambiar rápidamente si necesitas ajustar.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">4️⃣</span>
                Agrega más Series (Opcional)
              </h4>
              <p className="text-sm text-slate-300">
                Haz clic en "+ Agregar Serie" para registrar más sets del mismo ejercicio.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                <span className="text-lg">5️⃣</span>
                Repite con otros Ejercicios
              </h4>
              <p className="text-sm text-slate-300">
                Agrega tantos ejercicios como quieras a la sesión.
              </p>
            </div>

            <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg">
              <h4 className="font-bold text-green-300 text-sm mb-2">✅ Guarda tu Sesión</h4>
              <p className="text-sm text-slate-300">
                Al final, haz clic en "Guardar Sesión". ¡Listo! Tus datos se guardan automáticamente.
              </p>
            </div>
          </div>
        </section>

        {/* Herramientas */}
        <section className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 rounded-xl p-6 border border-indigo-700/30 shadow-lg">
          <h2 className="font-bold text-xl text-indigo-300 mb-4">🔧 Herramientas Disponibles</h2>
          <div className="space-y-3">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-indigo-300 text-sm mb-2 flex items-center gap-2">
                <Calculator size={16} />
                Calculadora e1RM
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                <strong>Úsala para estimar sin ir al gimnasio.</strong> Ingresa peso, reps y RIR, 
                y obtén tu e1RM teórico.
              </p>
              <p className="text-xs text-slate-400 italic">
                Ejemplo: 80kg × 5 reps + RIR 2 = e1RM 93kg
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-indigo-300 text-sm mb-2 flex items-center gap-2">
                <BarChart3 size={16} />
                Gráficas de Progreso
              </h4>
              <p className="text-sm text-slate-300">
                Haz clic en cualquier ejercicio de la pantalla de inicio. Se abrirá un modal con:
              </p>
              <ul className="text-xs text-slate-300 mt-2 space-y-1">
                <li>• Estadísticas por día, semana, mes o año</li>
                <li>• Gráfica de tendencia de tu e1RM</li>
                <li>• Mejor e1RM y promedio de cada período</li>
              </ul>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-indigo-300 text-sm mb-2 flex items-center gap-2">
                <User size={16} />
                Tu Perfil
              </h4>
              <p className="text-sm text-slate-300">
                Cambia tu nombre, alias, y unidad de peso (kg/lb) desde aquí.
              </p>
            </div>
          </div>
        </section>

        {/* Preguntas Frecuentes */}
        <section className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 rounded-xl p-6 border border-cyan-700/30 shadow-lg">
          <h2 className="font-bold text-xl text-cyan-300 mb-4">❓ Preguntas Frecuentes</h2>
          <div className="space-y-3">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-cyan-300 text-sm mb-2">¿Puedo cambiar entre KG y LB?</h4>
              <p className="text-sm text-slate-300">
                Sí, desde tu Perfil. La app convierte todo automáticamente, no afecta tus datos.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-cyan-300 text-sm mb-2">¿Mis datos están protegidos?</h4>
              <p className="text-sm text-slate-300">
                Sí, <strong>totalmente</strong>.
                Tus entrenamientos y datos personales son solo tuyos.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-cyan-300 text-sm mb-2">¿Funciona sin internet?</h4>
              <p className="text-sm text-slate-300">
                Sí, hay una caché local. Puedes registrar entrenamientos sin conexión 
                y se sincronizarán cuando vuelvas a conectar.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-cyan-300 text-sm mb-2">¿Cómo sé cuándo estoy "mejorando" vs "bajando"?</h4>
              <p className="text-sm text-slate-300">
                Mira el símbolo en la tarjeta del ejercicio en la página de inicio:
              </p>
              <ul className="text-xs text-slate-300 mt-2 space-y-1">
                <li>↗️ <strong>Mejorando:</strong> Tu e1RM es mayor que el promedio</li>
                <li>➡️ <strong>Estable:</strong> Variación normal</li>
                <li>↘️ <strong>Bajando:</strong> Descansa más, tal vez estés fatigado</li>
              </ul>
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