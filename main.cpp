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
//#define SHDPATH ""

int		SaraGlobal::xRes = 640;
int		SaraGlobal::yRes = 480;
bool	SaraGlobal::recompileShader = false;
bool	SaraGlobal::windowResize = false;
bool	SaraGlobal::postProcess = false;
bool	SaraGlobal::cameraMoving = false;
bool	SaraGlobal::cameraStartMoving = true;
float	SaraGlobal::angle[2] = { 0.0f, 0.0f };
double	SaraGlobal::startX = 0.0;
double	SaraGlobal::startY = 0.0;
int		SaraGlobal::shaderNumber = 0;
float	SaraGlobal::postProcVar = 2.20;


int main( void ) {

	glfwSetErrorCallback( error_callback );

	if (!glfwInit()) {
		std::cout << "ERROR: could not start GLFW3" << std::endl;
		return 1;
	}

	SaraWindowManager wndMgr( SaraGlobal::xRes, SaraGlobal::yRes );
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
	glfwSetCharCallback( wndMgr.getWndw(), (GLFWcharfun)TwEventCharGLFW );
	
	// LOOP
	while (!glfwWindowShouldClose( wndMgr.getWndw() )) {

		if (SaraGlobal::recompileShader) {
			mainShader.compileShaders();
			postProcShader.compileShaders();
			SaraGlobal::recompileShader = false;
		}

		mainRenderer.update();
		mainRenderer.mainDraw( SaraGlobal::postProcess );
		
		glfwPollEvents();
		glfwSwapBuffers( wndMgr.getWndw() );
	}
	
	// close GL context and any other GLFW resources
	glfwTerminate();
	return 0;
}

