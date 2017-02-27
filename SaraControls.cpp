#include "SaraControls.h"

void error_callback( int error, const char* description ) {
	std::cout << "Errore: " << description << std::endl;
}

void key_callback( GLFWwindow* window, int key, int scancode, int action, int mods ) {
	if (!TwEventKeyGLFW( key, action )) {
		if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
			glfwSetWindowShouldClose( window, GLFW_TRUE );
		if (key == GLFW_KEY_F7 && action == GLFW_PRESS)
			global_recompileShader = true;
		if (key == GLFW_KEY_P && action == GLFW_PRESS)
			global_postProcess = !global_postProcess;
	}
}


void cursor_position_callback( GLFWwindow* window, double xpos, double ypos ) {
	double incrementX, incrementY;
	if (!TwEventMousePosGLFW( xpos, ypos )) {
		if (global_cameraMoving == true) {
			incrementX = (xpos - global_startX) / 500.0 ;
			incrementY = (ypos - global_startY) / 500.0;
			global_angle[0] += incrementX;
			global_angle[1] += incrementY;
			global_startX = xpos;
			global_startY = ypos;
		}
	}
}

void mouse_button_callback( GLFWwindow* window, int button, int action, int mods ) {
	if (!TwEventMouseButtonGLFW( button, action )) {
		if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_PRESS) {
			global_cameraMoving = true;
			if (global_cameraStartMoving) {
				glfwGetCursorPos( window, &global_startX, &global_startY );
				global_cameraStartMoving = false;
			}
		}
		else if (button == GLFW_MOUSE_BUTTON_LEFT && action == GLFW_RELEASE) {
			global_cameraMoving = false;
			global_cameraStartMoving = true;
		}
	}
}

void scroll_callback( GLFWwindow* window, double xoffset, double yoffset ) {
	if (!TwEventMouseWheelGLFW( yoffset )) {
	}
}
