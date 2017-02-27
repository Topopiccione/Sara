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

int		global_xRes = 640;
int		global_yRes = 480;
bool	global_recompileShader = false;
bool	global_tweakBarsResize = false;
bool	global_postProcess = false;
bool	global_cameraMoving = false;
bool	global_cameraStartMoving = true;
float	global_angle[2] = { 0.0f, 0.0f };
double	global_startX = 0.0;
double	global_startY = 0.0;
int		global_shaderNumber = 0;


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

	std::vector<std::string> shaderNames = {
		SHDPATH + std::string( "shaders\\modExp.frag" ),
		SHDPATH + std::string( "shaders\\massiveClod.frag" ),
		SHDPATH + std::string( "shaders\\quadretti.frag" ),
		SHDPATH + std::string( "shaders\\test3.frag" ),
		SHDPATH + std::string( "shaders\\piloni.frag" ) };
		//SHDPATH + std::string( "shaders\\superstructure.frag" )

	SaraShaderManager mainShader( SHDPATH + std::string( "shaders\\mainOut.vert" ), shaderNames );

	SaraShaderManager postProcShader( SHDPATH + std::string( "shaders\\crossHatch.vert" ), SHDPATH + std::string( "shaders\\crossHatch.frag" ) );

	SaraRenderer mainRenderer( &wndMgr, &mainShader, &postProcShader );

	glfwSetKeyCallback( wndMgr.getWndw(), key_callback );
	glfwSetCursorPosCallback( wndMgr.getWndw(), cursor_position_callback );
	glfwSetMouseButtonCallback( wndMgr.getWndw(), mouse_button_callback );
	glfwSetScrollCallback( wndMgr.getWndw(), scroll_callback );
	glfwSetInputMode( wndMgr.getWndw(), GLFW_STICKY_MOUSE_BUTTONS, 0 );
	
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

