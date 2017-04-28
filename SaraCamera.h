#pragma once
#include <iostream>
#include <gl\glew.h>
#include <GLFW\glfw3.h>
#include <glm\glm.hpp>
#include <glm\vec3.hpp>
#include <glm\vec4.hpp>
#include <glm\gtc\quaternion.hpp>
#include "Sara.h"

class SaraCamera {
public:
	SaraCamera();
	~SaraCamera();

	glm::vec3 origin;
	glm::vec3 target;
	glm::vec3 upDrct;

	void update();
	void updatePosition();

private:
	float camPitch;
	float camHeadn;

	

};