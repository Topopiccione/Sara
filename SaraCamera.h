#pragma once
#include <iostream>
#include <gl\glew.h>
#include <GLFW\glfw3.h>
#include "Sara.h"

class SaraCamera {
public:
	SaraCamera();
	~SaraCamera();

private:
	float origin[3];
	float target[3];

};