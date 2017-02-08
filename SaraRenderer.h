#pragma once
#include <ctime>
#include <iostream>
#include <gl\glew.h>
#include <GLFW\glfw3.h>

#include "Sara.h"
#include "SaraWindowManager.h"
#include "SaraShaderManager.h"

class SaraRenderer {
public:
	SaraRenderer( SaraWindowManager	* wndMgr, SaraShaderManager * mainShader, SaraShaderManager * postProcessShader );
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

	// FBO e VBO
	GLuint					frameBufferObj;
	GLuint					frameBufferObjTex;
	GLuint					vao, vbo, ibo;

};