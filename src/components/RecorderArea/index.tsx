import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  logoCapture,
  logoHistory,
  logoTranslate,
  logoMaos,
} from '../../assets';
import { useHistory } from 'react-router-dom';
import paths from '../../constants/paths';
import axios from 'axios';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';
import { VideoOutputModal, TranslatingModal } from '../../components';

import './styles.css';

interface RecorderAreaProps {
  setVideosRecorded: Dispatch<SetStateAction<any>>;
  videosRecorded: any;
}

const RecorderArea = ({
  videosRecorded,
  setVideosRecorded,
}: RecorderAreaProps) => {
  const history = useHistory();
  const [results, setResults] = React.useState<any>([]);
  const [loading, setLoading] = React.useState<any>(false);
  const [toogleResult, setToogleResult] = React.useState(false);
  const [showModal, setShowModal] = useState(false);

  const takeVideo = async () => {
    history.push(paths.SIGNALCAPTURE);

    try {
      const options = { limit: 1, duration: 30 };
      const mediafile = await VideoCapturePlus.captureVideo(options);
      //@ts-ignore TODO cleanup this debug output
      localStorage.setItem('firstVideo', JSON.stringify(mediafile));
      setVideosRecorded(mediafile);
      history.push(paths.SIGNALCAPTURE);
    } catch (error) {
      setVideosRecorded(error);
    }
  };

  const translateVideo = async () => {
    const videosRecorded2 = [
      { label: 'opa1', url: 'opa2' },
      { label: 'opa11', url: 'opa22' },
      { label: 'opa111', url: 'opa222' },
      { label: 'opa1111', url: 'opa2222' },
    ];

    // const videosRecorded = JSON.parse(localStorage.allVideos);

    const arrayOfResults: any = [];

    setLoading(true);
    const result = await Promise.all(
      videosRecorded.map(async (item: any, key: number) => {
        const form = new FormData();
        form.append('file', item);

        try {
          const resultRequest = await axios.post(
            'http://127.0.0.1:5000/api/v1/recognition',
            form,
          );
          arrayOfResults.push(resultRequest.data[0].label);
        } catch (e) {
          console.log(e);
        }
      }),
    );

    setResults(arrayOfResults);
    setShowModal(true);
    setLoading(false);
    console.log(results);
  };

  useEffect(() => {
    if (
      sessionStorage.allVideos != undefined &&
      JSON.parse(sessionStorage.allVideos).length != 0
    ) {
      translateVideo();
    }
  }, [toogleResult]);

  const renderOutputs = () => {
    return results.map((item: string) => <span key={item}>{item}</span>);
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
      {loading && <TranslatingModal />}
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
