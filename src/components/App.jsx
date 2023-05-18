import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Searchbar, ImageGallery, Button, Loader, Modal } from './index';
import { searchImages } from 'services/pixabay-api';

const STATUS = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
  IDLE: 'IDLE',
};

export const App = () => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!query) return;
    getImages();
    // eslint-disable-next-line
  }, [query, page]);

  const getImages = async () => {
    setStatus(STATUS.PENDING);

    try {
      const { hits, totalHits } = await searchImages(query, page);

      if (!hits.length) {
        toast.info('Oooh oh, there are no results that match your query.');
        return;
      }

      setImages([...images, ...hits]);

      if (page === 1) {
        toast.info(`Hooray! We found ${totalHits} image(s).`);
        calculateTotalPages(totalHits);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setStatus(STATUS.FULFILLED);
    }
  };

  const calculateTotalPages = total => setTotalPages(Math.ceil(total / 12));

  const handleSearchQuery = query => {
    setStatus(STATUS.IDLE);
    setQuery(query);
    setPage(1);
    setImages([]);
    setTotalPages(1);
  };

  const setActiveImageUrl = url => setActiveImage(url);

  const setNextPage = () => setPage(page => page + 1);

  const isVisibleButton = page < totalPages && status === STATUS.FULFILLED;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridGap: '16px',
        paddingBottom: '24px',
      }}
    >
      <Searchbar onSearch={handleSearchQuery} />

      {images.length > 0 && (
        <ImageGallery images={images} onClick={setActiveImageUrl} />
      )}

      {activeImage && (
        <Modal url={activeImage} onClose={() => setActiveImageUrl(null)} />
      )}

      {isVisibleButton && <Button onClick={setNextPage}>Load More</Button>}

      {status === STATUS.PENDING && <Loader />}

      <ToastContainer theme="colored" autoClose={3000} />
    </div>
  );
};
