import { supabase } from './supabaseConfig';

export const uploadImageToSupabase = async (uri: string, fileName: string) => {
  // Convirtiendo el URI a un Blob para que Supabase lo pueda manejar
  const response = await fetch(uri);
  const blob = await response.blob();

  // Subir la imagen al almacenamiento de Supabase
  const { data, error } = await supabase.storage
    .from('menuimgs') // El nombre del bucket donde se guardan las imágenes
    .upload(fileName, blob);

  if (error) {
    console.error('Error al subir la imagen:', error.message);
    return null;
  }

  return data?.path; // Retorna la URL de la imagen
};
