import React from "react";
import { Composition } from "remotion";
import { RockyWorldsAd } from "./RockyWorldsAd";

export const RemotionRoot = () => {
  return (
    <Composition
      id="RockyWorldsAd"
      component={RockyWorldsAd}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={900}
    />
  );
};
