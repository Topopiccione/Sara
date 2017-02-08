#include "SaraWindowManager.h"

static void win_resize_callback( GLFWwindow * win, int w, int h ) {
	global_xRes = w;
	global_yRes = h;
	glViewport( 0, 0, global_xRes, global_yRes );
	glMatrixMode( GL_PROJECTION );
	glLoadIdentity();
	glMatrixMode( GL_MODELVIEW );
	glLoadIdentity();
}

SaraWindowManager::SaraWindowManager( int xSize, int ySize ) :
			x( xSize ),
			y( ySize ) {
	
	//glfwWindowHint( GLFW_SAMPLES, 4 );		// 4x antialiasing

	window = glfwCreateWindow( x, y, "Sara - Main window", NULL, NULL );
	if (!window) {
		std::cout << "ERROR: could not open window with GLFW3" << std::endl;
		glfwTerminate();
	}
	glfwSetWindowSizeCallback( window, win_resize_callback );
}

SaraWindowManager::~SaraWindowManager() {}

GLFWwindow * SaraWindowManager::getWndw() {
	return window;
}

GLFWwindow * SaraWindowManager::getWndw() const {
	return window;
}
/*
int SaraWindowManager::getXsize() {
	return x;
}

int SaraWindowManager::getYsize() {
	return y;
}

void SaraWindowManager::setXsize( int xSize ) {
	x = xSize;
}

void SaraWindowManager::setYsize( int ySize ) {
	y = ySize;
}
*/