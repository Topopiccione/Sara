#pragma once
#include <iostream>

namespace SaraGlobal {

	extern int		xRes;
	extern int		yRes;
	extern float	angle[2];
	extern double	startX;
	extern double	startY;
	extern int		shaderNumber;
	extern float	postProcVar;
	// events
	extern bool		recompileShader;
	extern bool		windowResize;
	extern bool		postProcess;
	extern bool		cameraMoving;
	extern bool		cameraStartMoving;
	extern bool		cameraForward;
	extern bool		cameraBackward;
	extern bool		cameraStrafeLeft;
	extern bool		cameraStrafeRight;

};
