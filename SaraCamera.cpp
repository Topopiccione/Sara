#include "SaraCamera.h"

SaraCamera::SaraCamera() {
	origin = { 0.0f, 0.0f, 0.0f };
	target = { 1.0f, 0.0f, 0.0f };
	upDrct = { 0.0f, 1.0f, 0.0f };
	camPitch = 0.0f;
	camHeadn = 0.0f;
}

SaraCamera::~SaraCamera() {}

void SaraCamera::update() {

	camPitch = SaraGlobal::angle[1];
	camHeadn = SaraGlobal::angle[0];
	glm::vec3 cameraDir = glm::normalize( target - origin );

	glm::vec3 cameraRight = glm::cross( cameraDir, upDrct );
	glm::quat pitchQuat = glm::angleAxis( camPitch, cameraRight );
	glm::quat headnQuat = glm::angleAxis( camHeadn, upDrct );
	glm::quat rotQuat   = glm::normalize( glm::cross( pitchQuat, headnQuat ) );

	//target = rotQuat * target * glm::conjugate( rotQuat );
	target = rotQuat * target * glm::conjugate( rotQuat );
	upDrct = rotQuat * upDrct * glm::conjugate( rotQuat );

	SaraGlobal::angle[0] = 0.0f;
	SaraGlobal::angle[1] = 0.0f;
	
}