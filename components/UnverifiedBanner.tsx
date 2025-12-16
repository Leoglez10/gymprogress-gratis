import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    email: string;
}

export const UnverifiedBanner: React.FC<Props> = ({ email }) => {
    return (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-3 flex items-center justify-center text-sm">
            <AlertCircle size={16} className="text-yellow-500 mr-2 flex-shrink-0" />
            <p className="text-yellow-200">
                <strong>Cuenta no verificada.</strong> Estás en modo de prueba.
                Verifica tu correo <strong className="text-yellow-100">{email}</strong> para acceder a todas las funciones.
            </p>
        </div>
    );
};
