#include "SaraCamera.h"

SaraCamera::SaraCamera() {
	origin = { 1.0f, 0.0f, 0.0f };
	target = { 0.0f, 1.0f, 0.0f };
	upDrct = { 0.0f, 0.0f, 1.0f };
	camPitch = 0.0f;
	camHeadn = 0.0f;
}

SaraCamera::~SaraCamera() {}

void SaraCamera::updatePosition() {
	glm::vec3 cameraDir = glm::normalize( target - origin );
	if (SaraGlobal::cameraForward) {
		origin += cameraDir * 0.1f;
		target += cameraDir * 0.1f;
	}
	if (SaraGlobal::cameraBackward) {
		origin -= cameraDir * 0.1f;
		target -= cameraDir * 0.1f;
	}

	glm::vec3 cameraRight = glm::cross( cameraDir, upDrct );
	if (SaraGlobal::cameraStrafeRight) {
		origin += cameraRight * 0.1f;
		target += cameraRight * 0.1f;
	}
	if (SaraGlobal::cameraStrafeLeft) {
		origin -= cameraRight * 0.1f;
		target -= cameraRight * 0.1f;
	}
}



void SaraCamera::update() {

	camPitch = SaraGlobal::angle[1];
	camHeadn = SaraGlobal::angle[0];
	glm::vec3 cameraDir = glm::normalize( target - origin );
	glm::vec3 cameraRight = glm::cross( cameraDir, upDrct );

	glm::quat pitchQuat = glm::angleAxis( camPitch, cameraRight );
	glm::quat headnQuat = glm::angleAxis( camHeadn, upDrct );
	glm::quat rotQuat   = glm::normalize( glm::cross( pitchQuat, headnQuat ) );

	target = rotQuat * target * glm::conjugate( rotQuat );
	upDrct = rotQuat * upDrct * glm::conjugate( rotQuat );

	SaraGlobal::angle[0] = 0.0f;
	SaraGlobal::angle[1] = 0.0f;
	
}