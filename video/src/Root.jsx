import React from "react";
import { Composition } from "remotion";
import { RockyWorldsAd } from "./RockyWorldsAd";

const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;

export const RemotionRoot = () => {
  return (
    <Composition
      id="RockyWorldsAd"
      component={RockyWorldsAd}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
      fps={30}
      durationInFrames={900}
    />
  );
};
