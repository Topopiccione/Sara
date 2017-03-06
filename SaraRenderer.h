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
	SaraRenderer( SaraWindowManager	* wndMgr, SaraShaderManager * mainShader, SaraShaderManager * postProcessShader, SaraCamera * camera );
	~SaraRenderer();

	void mainDraw( bool postProcess );
	void fboDraw();
	void update( float newTime );
	void update( void );

private:
	void setupFBO( void );
	void setupVBO( void );

	std::clock_t start;
	float					t;

	SaraShaderManager	*	mainShd;
	SaraShaderManager	*	postProcShd;
	SaraWindowManager	*	wndMgr;
	SaraCamera			*	came;
	SaraTweakBar			twb;

	// FBO e VBO
	GLuint					frameBufferObj;
	GLuint					frameBufferObjTex;
	GLuint					vao, vbo, ibo;

	// Variabili di rendering
	float				cameraDirection[3];

};