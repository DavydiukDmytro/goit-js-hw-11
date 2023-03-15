import axios from 'axios';

export async function getPhotos(url, params)
{
  const response = await axios.get(url, { params });
    return response.data;
}