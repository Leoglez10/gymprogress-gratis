import React, { useState } from 'react';
import { UserProfile } from '../types';
import { store } from '../services/store';

interface Props {
  profile: UserProfile;
  onUpdate: (newProfile: UserProfile) => void;
  onReset: () => void;
}

export const ProfileView: React.FC<Props> = ({ profile, onUpdate, onReset }) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    alias: profile.alias || '',
    weightUnit: profile.weightUnit,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: formData.name,
      alias: formData.alias,
      weightUnit: formData.weightUnit as 'kg' | 'lb',
    };
    store.updateProfile(updated);
    onUpdate(updated);
    alert('Perfil actualizado correctamente');
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-bold mb-6 text-white">Editar Perfil</h2>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-slate-700 shadow-xl text-white">
              <span>{formData.alias ? formData.alias.substring(0, 2).toUpperCase() : formData.name.substring(0, 2).toUpperCase()}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Nombre Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Alias (Display Name)</label>
            <input
              type="text"
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              placeholder="Ej. GymRat99"
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Unidad de Peso</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center transition-colors ${formData.weightUnit === 'kg' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-600 text-slate-400'}`}>
                <input
                  type="radio"
                  name="weightUnit"
                  value="kg"
                  checked={formData.weightUnit === 'kg'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-bold">Kilogramos (kg)</span>
              </label>
              <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center transition-colors ${formData.weightUnit === 'lb' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-600 text-slate-400'}`}>
                <input
                  type="radio"
                  name="weightUnit"
                  value="lb"
                  checked={formData.weightUnit === 'lb'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-bold">Libras (lb)</span>
              </label>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-4">
            Guardar Cambios
          </button>
        </form>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-red-900/30">
        <h3 className="font-bold text-red-400 mb-2">Zona de Peligro</h3>
        <p className="text-sm text-slate-400 mb-4">Esta es una versión demo. Si reseteas, perderás todo el historial guardado en este navegador.</p>
        <button onClick={onReset} className="text-red-400 text-sm hover:text-red-300 underline font-medium">
          Borrar todos los datos y reiniciar
        </button>
      </div>
    </div>
  );
};