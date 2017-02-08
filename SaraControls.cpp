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
	}
}


void cursor_position_callback( GLFWwindow* window, double xpos, double ypos ) {
	if (!TwEventMousePosGLFW( xpos, ypos )) {
	}
}

void mouse_button_callback( GLFWwindow* window, int button, int action, int mods ) {
	if (!TwEventMouseButtonGLFW( button, action )) {
		//if (button == GLFW_MOUSE_BUTTON_RIGHT && action == GLFW_PRESS)
	}
}

void scroll_callback( GLFWwindow* window, double xoffset, double yoffset ) {
	if (!TwEventMouseWheelGLFW( yoffset )) {
	}
}
