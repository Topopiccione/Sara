#pragma once
#include <iostream>
#include <gl\glew.h>
#include <GLFW\glfw3.h>
#include <glm\glm.hpp>
#include <glm/gtx/transform.hpp>
#include <glm/gtc/quaternion.hpp>
#include <glm/gtx/quaternion.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "Sara.h"

class SaraCamera {
public:
	SaraCamera();
	~SaraCamera();

	glm::vec3 origin;
	glm::vec3 target;
	glm::vec3 upDrct;

	glm::quat orientation;

	void update();
	void updatePosition();

private:
	float camPitch;
	float camHeadn;
};