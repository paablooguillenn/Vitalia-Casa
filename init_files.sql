-- SQL para crear la tabla de archivos adjuntos (files)
CREATE TABLE public.files (
    id bigserial PRIMARY KEY,
    appointment_id int8 NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    url varchar(255) NOT NULL,
    type varchar(100) NOT NULL,
    filename varchar(255) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas por cita
CREATE INDEX idx_files_appointment_id ON public.files(appointment_id);
