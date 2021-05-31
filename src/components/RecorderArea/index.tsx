import React, { Dispatch, SetStateAction, useState } from 'react';
import { logoCapture, logoHistory, logoTranslate } from '../../assets';
import { useHistory } from 'react-router-dom';
import paths from '../../constants/paths';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';

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

  const takeVideo = async () => {
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

  return (
    <>
      <div className="main-area-recorder">
        <img src={logoTranslate}></img>
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
    </>
  );
};

export default RecorderArea;
