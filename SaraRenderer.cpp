#include "SaraRenderer.h"


SaraRenderer::SaraRenderer( SaraWindowManager * windowManager, SaraShaderManager * mainShader, SaraShaderManager * postProcessShader ) :
			wndMgr( windowManager ),
			mainShd( mainShader ),
			postProcShd( postProcessShader ) {

	// get version info
	const GLubyte* renderer = glGetString( GL_RENDERER ); // get renderer string
	const GLubyte* version = glGetString( GL_VERSION ); // version as a string
	std::cout << "Renderer: " << renderer << std::endl;
	std::cout << "OpenGL version supported: " << version << std::endl;

	setupFBO();
	setupVBO();

	// tell GL to only draw onto a pixel if the shape is closer to the viewer
	glEnable( GL_TEXTURE_2D );
	glViewport( 0, 0, wndMgr->getXsize(), wndMgr->getYsize() );
	glMatrixMode( GL_PROJECTION );
	glLoadIdentity();
	glMatrixMode( GL_MODELVIEW );
	glLoadIdentity();
	glShadeModel( GL_SMOOTH ); // questo andrebbe rivisto

	glEnable( GL_DEPTH_TEST ); // enable depth-testing
	glDepthFunc( GL_LESS ); // depth-testing interprets a smaller value as "closer"
	
}

SaraRenderer::~SaraRenderer() {
}

void SaraRenderer::update( float newTime ) {
	t = newTime;
}

void SaraRenderer::mainDraw( bool postProcess ) {
	if (postProcess)
		glBindFramebuffer( GL_FRAMEBUFFER, frameBufferObj );

	glClearColor( 1.0, 0.0, 0.0, 1.0 );
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	//glUseProgram( shdprog );
	glBindProgramPipeline( mainShd->getPipeline() );

	mainShd->setUniforms( wndMgr->getXsize(), wndMgr->getYsize(), t, 0, 0.5 );

	glBindVertexArray( vao );
		glDrawArrays( GL_QUADS, 0, 4 );
	glBindVertexArray( 0 );

	//glUseProgram( 0 );
	glBindProgramPipeline( 0 );

	if (postProcess) {
		glBindFramebuffer( GL_FRAMEBUFFER, 0 );
		fboDraw();
	}
}

void SaraRenderer::fboDraw( void ) {
	glClearColor( 1.0, 0.0, 1.0, 1.0 );
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	glBindProgramPipeline( postProcShd->getPipeline() );

	glActiveTexture( GL_TEXTURE0 );
	glBindTexture( GL_TEXTURE_2D, frameBufferObjTex );

	mainShd->setUniforms( wndMgr->getXsize(), wndMgr->getYsize(), t, 0, 0.5 );

	glBindVertexArray( vao );
	glDrawArrays( GL_QUADS, 0, 4 );
	glBindVertexArray( 0 );

	glBindProgramPipeline( 0 );
}


void SaraRenderer::setupFBO( void ) {
	// genero texture da collegare al FBO
	glGenTextures( 1, &frameBufferObjTex );
	glBindTexture( GL_TEXTURE_2D, frameBufferObjTex );
	glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
	//glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR );
	//glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP);
	//glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP);
	glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE );
	glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE );
	glTexParameteri( GL_TEXTURE_2D, GL_GENERATE_MIPMAP, GL_TRUE ); // automatic mipmap generation included in OpenGL v1.4
	glTexImage2D( GL_TEXTURE_2D, 0, GL_RGBA8, wndMgr->getXsize(), wndMgr->getYsize(), 0, GL_RGBA, GL_UNSIGNED_BYTE, 0 );
	glBindTexture( GL_TEXTURE_2D, 0 );

	// creazione FBO
	glGenFramebuffers( 1, &frameBufferObj );
	glBindFramebuffer( GL_FRAMEBUFFER, frameBufferObj );
	glFramebufferTexture2D( GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, frameBufferObjTex, 0 );
	glBindFramebuffer( GL_FRAMEBUFFER, 0 );
}

void SaraRenderer::setupVBO( void ) {
	glGenVertexArrays( 1, &vao );
	glBindVertexArray( vao );
	glGenBuffers( 1, &vbo );
	glBindBuffer( GL_ARRAY_BUFFER, vbo );

	GLfloat vertices[] = {
		-1.0f, -1.0f,		// coordinate della quad
		1.0f, -1.0f,
		0.5f, 1.0f, //1.0f, 1.0f,
		-1.0f, 1.0f,
		0.0f, 1.0f,		// coordinate della texture gi� girate
		1.0f, 1.0f,
		1.0f, 0.0f,
		0.0f, 0.0f,
	};

	glBufferData( GL_ARRAY_BUFFER, sizeof( vertices ), vertices, GL_STATIC_DRAW );
	glEnableVertexAttribArray( 0 );
	glVertexAttribPointer( 0, 2, GL_FLOAT, GL_FALSE, 0, 0 );
	glEnableVertexAttribArray( 1 );
	glVertexAttribPointer( 1, 2, GL_FLOAT, GL_FALSE, 0, (GLvoid*)(8 * sizeof( GL_FLOAT )) );

	glBindVertexArray( 0 );
}



/*
while (!glfwWindowShouldClose( wndMgr.getWndw() )) {
	// wipe the drawing surface clear
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
	glUseProgram( shader_programme );
	glBindVertexArray( vao );
	// draw points 0-3 from the currently bound VAO with current in-use shader
	glDrawArrays( GL_TRIANGLES, 0, 3 );
	// update other events like input handling 
	glfwPollEvents();
	// put the stuff we've been drawing onto the display
	glfwSwapBuffers( wndMgr.getWndw() );
}
*/