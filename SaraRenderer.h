#pragma once
#include <ctime>
#include <iostream>
#include <gl\glew.h>
#include <GLFW\glfw3.h>

#include "Sara.h"
#include "SaraWindowManager.h"
#include "SaraShaderManager.h"
#include "SaraTweakBar.h"
#include "SaraCamera.h"

class SaraRenderer {
public:
	SaraRenderer( SaraWindowManager	* wndMgr, SaraShaderManager * mainShader, SaraShaderManager * postProcessShader, SaraShaderManager * procTexShader, SaraCamera * camera );
	~SaraRenderer();

	void mainDraw( bool postProcess );
	void fboDraw();
	void procTexDraw();
	void update( float newTime );
	void update( void );

	const int				texXsize = 1200;
	const int				texYsize = 1200;

private:
	void setupFBO( GLuint * obj, GLuint * objTex, int xSize, int ySize );
	void setupVBO( void );

	std::clock_t start;
	float					t;

	SaraShaderManager	*	mainShd;
	SaraShaderManager	*	postProcShd;
	SaraShaderManager	*	procTexShd;
	SaraWindowManager	*	wndMgr;
	SaraCamera			*	came;
	SaraTweakBar			twb;

	// FBO e VBO
	GLuint					frameBufferObj;
	GLuint					frameBufferObjTex;
	GLuint					procTextureObj;
	GLuint					procTextureObjTex;
	GLuint					vao, vbo, ibo;

	// Variabili di rendering
	float				cameraDirection[3];

};