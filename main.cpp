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
#include "SaraTweakBar.h"
#include "SaraControls.h"

#define SHDPATH "C:\\Users\\User\\Documents\\git\\Sara\\"

int global_xRes = 640;
int global_yRes = 480;
bool global_recompileShader = false;
bool global_tweakBarsResize = false;

/*
static void error_callback( int error, const char* description ) {
	std::cout << "Errore: " << description << std::endl;
}

static void key_callback( GLFWwindow* window, int key, int scancode, int action, int mods ) {
	if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
		glfwSetWindowShouldClose( window, GLFW_TRUE );
	if (key == GLFW_KEY_F7 && action == GLFW_PRESS)
		global_recompileShader = true;
}*/


int main( void ) {

	glfwSetErrorCallback( error_callback );

	if (!glfwInit()) {
		std::cout << "ERROR: could not start GLFW3" << std::endl;
		return 1;
	}

	SaraWindowManager wndMgr( global_xRes, global_yRes );
	glfwMakeContextCurrent( wndMgr.getWndw() );
	glfwSetKeyCallback( wndMgr.getWndw(), key_callback );
	/*
	glfwSetMouseButtonCallback( (GLFWmousebuttonfun)TwEventMouseButtonGLFW );
	glfwSetMousePosCallback( (GLFWmouseposfun)TwEventMousePosGLFW );
	glfwSetMouseWheelCallback( (GLFWmousewheelfun)TwEventMouseWheelGLFW );
	glfwSetKeyCallback( (GLFWkeyfun)TwEventKeyGLFW );
	glfwSetCharCallback( (GLFWcharfun)TwEventCharGLFW );*/

	// start GLEW extension handler
	glewExperimental = GL_TRUE;
	GLenum err = glewInit();
	if (GLEW_OK != err)
		std::cout << "Errore glew init: " << glewGetErrorString( err ) << std::endl;

	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\modExp.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\quadretti.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\superstructure.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\test3.frag" ) );
	SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\piloni.frag" ) );
	SaraShaderManager postProcShader( SHDPATH + std::string( "shaders\\crossHatch.vert" ), SHDPATH + std::string( "shaders\\crossHatch.frag" ) );

	SaraRenderer mainRenderer( &wndMgr, &mainShader, &postProcShader );

	//SaraTweakBar twb( "Tua madre" );
	glfwSetCursorPosCallback( wndMgr.getWndw(), cursor_position_callback );
	glfwSetMouseButtonCallback( wndMgr.getWndw(), mouse_button_callback );
	glfwSetScrollCallback( wndMgr.getWndw(), scroll_callback );
	
	// LOOP
	while (!glfwWindowShouldClose( wndMgr.getWndw() )) {

		if (global_recompileShader) {
			mainShader.recompileShaders();
			global_recompileShader = false;
		}

		mainRenderer.update();
		mainRenderer.mainDraw( false );

		/*
		if (global_tweakBarsResize) {
			twb.resize();
			global_tweakBarsResize = false;
		}
		twb.draw();*/
		
		glfwPollEvents();
		glfwSwapBuffers( wndMgr.getWndw() );
	}
	
	// close GL context and any other GLFW resources
	glfwTerminate();
	return 0;
}

