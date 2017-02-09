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
bool global_postProcess = false;
float global_cameraDirection[3] = { -0.2f, 0.5f, -1.0f };


int main( void ) {

	glfwSetErrorCallback( error_callback );

	if (!glfwInit()) {
		std::cout << "ERROR: could not start GLFW3" << std::endl;
		return 1;
	}

	SaraWindowManager wndMgr( global_xRes, global_yRes );
	glfwMakeContextCurrent( wndMgr.getWndw() );

	// start GLEW extension handler
	glewExperimental = GL_TRUE;
	GLenum err = glewInit();
	if (GLEW_OK != err)
		std::cout << "Errore glew init: " << glewGetErrorString( err ) << std::endl;

	SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\modExp.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\quadretti.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\superstructure.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\test3.frag" ) );
	//SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), SHDPATH + std::string( "shaders\\piloni.frag" ) );
	SaraShaderManager postProcShader( SHDPATH + std::string( "shaders\\crossHatch.vert" ), SHDPATH + std::string( "shaders\\crossHatch.frag" ) );

	SaraRenderer mainRenderer( &wndMgr, &mainShader, &postProcShader );

	glfwSetKeyCallback( wndMgr.getWndw(), key_callback );
	glfwSetCursorPosCallback( wndMgr.getWndw(), cursor_position_callback );
	glfwSetMouseButtonCallback( wndMgr.getWndw(), mouse_button_callback );
	glfwSetScrollCallback( wndMgr.getWndw(), scroll_callback );
	
	// LOOP
	while (!glfwWindowShouldClose( wndMgr.getWndw() )) {

		if (global_recompileShader) {
			mainShader.compileShaders();
			global_recompileShader = false;
		}

		mainRenderer.update();
		mainRenderer.mainDraw( global_postProcess );
		
		glfwPollEvents();
		glfwSwapBuffers( wndMgr.getWndw() );
	}
	
	// close GL context and any other GLFW resources
	glfwTerminate();
	return 0;
}

