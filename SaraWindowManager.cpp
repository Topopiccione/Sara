#include "SaraWindowManager.h"

SaraWindowManager::SaraWindowManager( int xSize, int ySize ) :
			x( xSize ),
			y( ySize ) {

	glfwWindowHint( GLFW_CONTEXT_VERSION_MAJOR, 3 );
	glfwWindowHint( GLFW_CONTEXT_VERSION_MINOR, 2 );
	glfwWindowHint( GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE );
	glfwWindowHint( GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE );

	window = glfwCreateWindow( x, y, "Sara - Main window", NULL, NULL );
	if (!window) {
		std::cout << "ERROR: could not open window with GLFW3" << std::endl;
		glfwTerminate();
	}
}

SaraWindowManager::~SaraWindowManager() {}

GLFWwindow * SaraWindowManager::getWndw() {
	return window;
}

GLFWwindow * SaraWindowManager::getWndw() const {
	return window;
}

int SaraWindowManager::getXsize() {
	return x;
}

int SaraWindowManager::getYsize() {
	return y;
}