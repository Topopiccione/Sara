// --------------------------------
// Sara avvalora ricorsivi acronimi
// --------------------------------

// Richiede: GLEW, GLFW, AntTweakBar, OpenGL e poco altro...

#include <gl\glew.h>
#include <GLFW\glfw3.h>

#include "Sara.h"
#include "SaraWindowManager.h"
#include "SaraRenderer.h"
#include "SaraShaderManager.h"

#define SHDPATH "C:\\Users\\User\\Documents\\git\\Sara\\"

static void error_callback( int error, const char* description ) {
	std::cout << "Errore: " << description << std::endl;
}

static void key_callback( GLFWwindow* window, int key, int scancode, int action, int mods ) {
	if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
		glfwSetWindowShouldClose( window, GLFW_TRUE );
}

int main( void ) {

	glfwSetErrorCallback( error_callback );

	if (!glfwInit()) {
		std::cout << "ERROR: could not start GLFW3" << std::endl;
		return 1;
	}
	
	SaraWindowManager wndMgr( 640, 480 );
	glfwMakeContextCurrent( wndMgr.getWndw() );
	glfwSetKeyCallback( wndMgr.getWndw(), key_callback );

	// start GLEW extension handler
	glewExperimental = GL_TRUE;
	glewInit();

	SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\test.frag" ) );
	//SaraShaderManager postProcShader( SHDPATH + std::string( "shaders\\crossHatch.vert" ), SHDPATH + std::string( "shaders\\crossHatch.frag" ) );

	//SaraRenderer mainRenderer( &wndMgr, &mainShader, &postProcShader );
	SaraRenderer mainRenderer( &wndMgr, &mainShader, nullptr );
	
	/* LOOP */
	while (!glfwWindowShouldClose( wndMgr.getWndw() )) {

		mainRenderer.update( 12.5 );
		mainRenderer.mainDraw( false );

		glfwPollEvents();
		glfwSwapBuffers( wndMgr.getWndw() );
	}
	
	// close GL context and any other GLFW resources
	glfwTerminate();
	return 0;
}
