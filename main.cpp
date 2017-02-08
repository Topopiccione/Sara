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
	
	SaraWindowManager wndMgr( global_xRes, global_yRes );
	glfwMakeContextCurrent( wndMgr.getWndw() );
	glfwSetKeyCallback( wndMgr.getWndw(), key_callback );

	// start GLEW extension handler
	glewExperimental = GL_TRUE;
	GLenum err = glewInit();
	if (GLEW_OK != err)
		std::cout << "Errore glew init: " << glewGetErrorString( err ) << std::endl;

	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\modExp.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\quadretti.frag" ) );
	SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\superstructure.frag" ) );
	SaraShaderManager postProcShader( SHDPATH + std::string( "shaders\\crossHatch.vert" ), SHDPATH + std::string( "shaders\\crossHatch.frag" ) );

	SaraRenderer mainRenderer( &wndMgr, &mainShader, &postProcShader );
	
	// LOOP
	while (!glfwWindowShouldClose( wndMgr.getWndw() )) {

		mainRenderer.update();
		mainRenderer.mainDraw( false );

		glfwPollEvents();
		glfwSwapBuffers( wndMgr.getWndw() );
	}
	
	// close GL context and any other GLFW resources
	glfwTerminate();
	return 0;
}

