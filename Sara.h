#pragma once
#include <iostream>

extern int		global_xRes;
extern int		global_yRes;
// global_cameraDirection è in coordinate sferiche: (phi, theta, ro)
extern float	global_cameraDirection[3];
extern double	global_startX;
extern double	global_startY;

// events
extern bool		global_recompileShader;
extern bool		global_tweakBarsResize;
extern bool		global_postProcess;
extern bool		global_cameraMoving;
extern bool		global_cameraStartMoving;
