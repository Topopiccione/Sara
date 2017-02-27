#include "SaraControls.h"

void error_callback( int error, const char* description ) {
	std::cout << "Errore: " << description << std::endl;
}

void key_callback( GLFWwindow* window, int key, int scancode, int action, int mods ) {
	if (!TwEventKeyGLFW( key, action )) {
		if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
			glfwSetWindowShouldClose( window, GLFW_TRUE );
		if (key == GLFW_KEY_F7 && action == GLFW_PRESS)
			SaraGlobal::recompileShader = true;
		if (key == GLFW_KEY_P && action == GLFW_PRESS)
			SaraGlobal::postProcess = !SaraGlobal::postProcess;
	}
}

/*void character_callback( GLFWwindow* window, unsigned int codepoint ) {
	if (!TwEventCharGLFW(codepoint, NULL)) {

	}
}*/


void cursor_position_callback( GLFWwindow* window, double xpos, double ypos ) {
	double incrementX, incrementY;
	if (!TwEventMousePosGLFW( xpos, ypos )) {
		if (SaraGlobal::cameraMoving == true) {
			incrementX = (xpos - SaraGlobal::startX) / 500.0;
			incrementY = (ypos - SaraGlobal::startY) / 500.0;
			SaraGlobal::angle[0] += incrementX;
			SaraGlobal::angle[1] += incrementY;
			SaraGlobal::startX = xpos;
			SaraGlobal::startY = ypos;
		}
	}
}

void mouse_button_callback( GLFWwindow* window, int button, int action, int mods ) {
	if (!TwEventMouseButtonGLFW( button, action )) {
		if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_PRESS) {
			SaraGlobal::cameraMoving = true;
			if (SaraGlobal::cameraStartMoving) {
				glfwGetCursorPos( window, &SaraGlobal::startX, &SaraGlobal::startY );
				SaraGlobal::cameraStartMoving = false;
			}
		}
		else if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_RELEASE) {
			SaraGlobal::cameraMoving = false;
			SaraGlobal::cameraStartMoving = true;
		}
	}
}

void scroll_callback( GLFWwindow* window, double xoffset, double yoffset ) {
	if (!TwEventMouseWheelGLFW( yoffset )) {
	}
}
