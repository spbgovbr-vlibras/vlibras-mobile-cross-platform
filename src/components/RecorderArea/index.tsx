import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  logoCapture,
  logoHistory,
  logoTranslate,
  logoMaos,
} from '../../assets';
import { useHistory, useLocation } from 'react-router-dom';
import paths from '../../constants/paths';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { Creators } from 'store/ducks/video';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';
import { VideoOutputModal, TranslatingModal } from '../../components';

import './styles.css';

const RecorderArea = () => {
  const history = useHistory();
  const location = useLocation();

  const [results, setResults] = React.useState<any>([]);
  const [loading, setLoading] = React.useState<any>(false);
  const [toogleResult, setToogleResult] = React.useState(false);
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );

  const lastTranslate = useSelector(
    ({ video }: RootState) => video.lastTranslate,
  );

  const takeVideo = async () => {
    history.push(paths.SIGNALCAPTURE);

    try {
      // const options = { limit: 1, duration: 30 };
      // const mediafile = await VideoCapturePlus.captureVideo(options);
      // dispatch(Creators.setCurrentArrayVideo(mediafile));
      dispatch(Creators.setCurrentArrayVideo([{ name: 'opa', size: '123' }]));

      history.push(paths.SIGNALCAPTURE);
    } catch (error) {
      console.log(error);
    }
  };

  const translateVideo = async () => {
    const arrayOfResults: any = [];

    setLoading(true);
    setShowModal(false);

    await Promise.all(
      currentVideoArray.map(async (item: any, key: number) => {
        const form = new FormData();
        form.append('file', item);

        try {
          const resultRequest = await axios.post(
            'http://127.0.0.1:5000/api/v1/recognition',
            form,
          );

          if (resultRequest.data && resultRequest.data.length > 0)
            arrayOfResults.push(resultRequest.data[0].label);
        } catch (e) {
          arrayOfResults.push('dor de cabeça', 'alergia');
          console.log(e);
        }
      }),
    );

    setLoading(false);

    if (arrayOfResults.length != 0) {
      dispatch(Creators.setLastTranslator(arrayOfResults));
      setResults(arrayOfResults);
      setShowModal(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      location.pathname === paths.TRANSLATORPT &&
      currentVideoArray.length > 0
    ) {
      translateVideo();
    }
  }, [location]);

  const renderOutputs = () => {
    return lastTranslate.map((item: string) => <span key={item}>{item}</span>);
  };

  return (
    <>
      <div
        className="main-area-recorder"
        onClick={() => setToogleResult(!toogleResult)}
      >
        {results.length != 0 && (
          <>
            <div className="title-area">
              <img className="logo-icon" src={logoMaos} />
              <p className="title"> Ultima tradução </p>
            </div>
            <div className="list-outputs">
              <div className="container-outputs">{renderOutputs()}</div>
            </div>
          </>
        )}

        <img src={logoTranslate} className="bg-img"></img>
      </div>
      <div className="fixed-area-recorder">
        <p className="title-recorder">Use a câmera para gravar novos sinais</p>
        <div className="recorder-area">
          <div className="area-button-recorder">
            <img
              className="button-recorder"
              src={logoCapture}
              onClick={takeVideo}
              // onClick={() => history.push(paths.SIGNALCAPTURE)}
            ></img>
            <p> Câmera </p>
          </div>
          <img className="history-recorder" src={logoHistory}></img>
        </div>
      </div>
      <TranslatingModal loading={loading} setLoading={setLoading} />
      <VideoOutputModal
        outputs={results}
        showButtons={true}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export default RecorderArea;
