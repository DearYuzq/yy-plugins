import React from 'react';
import { Composition } from 'remotion';
import { PromoVideo } from './PromoVideo';

/**
 * Root component that defines all video compositions
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main promotional video composition */}
      <Composition
        id="PromoVideo"
        component={PromoVideo}
        durationInFrames={900} // 30 seconds @ 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

export default RemotionRoot;