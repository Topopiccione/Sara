#include "SaraWindowManager.h"

static void win_resize_callback( GLFWwindow * win, int w, int h ) {
	SaraGlobal::xRes = w;
	SaraGlobal::yRes = h;
	glViewport( 0, 0, SaraGlobal::xRes, SaraGlobal::yRes );
	glMatrixMode( GL_PROJECTION );
	glLoadIdentity();
	glMatrixMode( GL_MODELVIEW );
	glLoadIdentity();
	SaraGlobal::windowResize = true;
}

static void fb_resize_callback( GLFWwindow * win, int w, int h ) {
	glViewport( 0, 0, SaraGlobal::xRes, SaraGlobal::yRes );
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
	glfwSetFramebufferSizeCallback( window, fb_resize_callback );	// Ma questo serve a qualcosa?
}

SaraWindowManager::~SaraWindowManager() {}

GLFWwindow * SaraWindowManager::getWndw() {
	return window;
}

GLFWwindow * SaraWindowManager::getWndw() const {
	return window;
}
