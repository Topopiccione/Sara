#include "SaraRenderer.h"

SaraRenderer::SaraRenderer( SaraWindowManager * windowManager, SaraShaderManager * mainShader, SaraShaderManager * postProcessShader, SaraShaderManager * procTexShader, SaraCamera * cam ) :
			wndMgr( windowManager ),
			mainShd( mainShader ),
			postProcShd( postProcessShader ),
			procTexShd( procTexShader ),
			came( cam ),
			twb( "SaraParams" ) {

	const GLubyte* renderer = glGetString( GL_RENDERER );
	const GLubyte* version = glGetString( GL_VERSION );
	std::cout << "Renderer: " << renderer << std::endl;
	std::cout << "OpenGL version supported: " << version << std::endl;

	setupFBO( &frameBufferObj, &frameBufferObjTex, SaraGlobal::xRes, SaraGlobal::yRes );
	//setupFBO( &procTextureObj, &procTextureObjTex, SaraGlobal::xRes, SaraGlobal::yRes );
	setupFBO( &procTextureObj, &procTextureObjTex, texXsize, texYsize );
	setupVBO();

	glEnable( GL_TEXTURE_2D );
	glViewport( 0, 0, SaraGlobal::xRes, SaraGlobal::yRes );
	glMatrixMode( GL_PROJECTION );
	glLoadIdentity();
	glMatrixMode( GL_MODELVIEW );
	glLoadIdentity();
	glShadeModel( GL_SMOOTH ); // questo andrebbe rivisto

	glEnable( GL_DEPTH_TEST );
	glDepthFunc( GL_LESS );
		
	start = std::clock();
	
}

SaraRenderer::~SaraRenderer() {
}

void SaraRenderer::update( float newTime ) {
	t = newTime;
}

void SaraRenderer::update() {
	if (SaraGlobal::cameraMoving)
		came->update();
	t = static_cast<float>(std::clock() - start)  * 200 / (float)CLOCKS_PER_SEC;
	mainShd->checkGlobalShd();
}

void SaraRenderer::mainDraw( bool postProcess ) {
	if (postProcess) 
		glBindFramebuffer( GL_FRAMEBUFFER, frameBufferObj );

	glClearColor( 1.0, 0.0, 0.0, 1.0 );
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	glBindProgramPipeline( mainShd->getPipeline() );

	glActiveTexture( GL_TEXTURE0 );
	glBindTexture( GL_TEXTURE_2D, procTextureObjTex );

	//mainShd->setUniforms( SaraGlobal::xRes, SaraGlobal::yRes, t );
	mainShd->setUniforms( SaraGlobal::xRes, SaraGlobal::yRes, t, came->origin, came->target, came->upDrct, 0 );

	glBindVertexArray( vao );
		glDrawArrays( GL_QUADS, 0, 4 );
	glBindVertexArray( 0 );

	glBindProgramPipeline( 0 );
	
	if (postProcess) {
		glBindFramebuffer( GL_FRAMEBUFFER, 0 );
		fboDraw();
	}

	if (SaraGlobal::windowResize) {
		twb.resize();
		setupFBO( &frameBufferObj, &frameBufferObjTex, SaraGlobal::xRes, SaraGlobal::yRes );
		//setupFBO( &procTextureObj, &procTextureObjTex );
		SaraGlobal::windowResize = false;
	}
	twb.draw();
}

void SaraRenderer::fboDraw( void ) {
	glClearColor( 1.0, 0.0, 1.0, 1.0 );
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	glBindProgramPipeline( postProcShd->getPipeline() );

	glActiveTexture( GL_TEXTURE0 );
	//glBindTexture( GL_TEXTURE_2D, frameBufferObjTex );
	glBindTexture( GL_TEXTURE_2D, procTextureObjTex );

	postProcShd->setUniforms( SaraGlobal::xRes, SaraGlobal::yRes, t, 0, SaraGlobal::postProcVar );

	glBindVertexArray( vao );
	glDrawArrays( GL_QUADS, 0, 4 );
	glBindVertexArray( 0 );

	glBindProgramPipeline( 0 );
}

void SaraRenderer::procTexDraw() {
	glBindFramebuffer( GL_FRAMEBUFFER, procTextureObj );

	glClearColor( 1.0, 0.0, 0.0, 1.0 );
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	glBindProgramPipeline( procTexShd->getPipeline() );

	procTexShd->setUniforms( texXsize, texYsize, t, came->origin, came->target, came->upDrct );

	glBindVertexArray( vao );
	glDrawArrays( GL_QUADS, 0, 4 );
	glBindVertexArray( 0 );

	glBindProgramPipeline( 0 );

	glBindFramebuffer( GL_FRAMEBUFFER, 0 );
}




void SaraRenderer::setupFBO( GLuint * obj, GLuint * objTex, int xSize, int ySize ) {
	// genero texture da collegare al FBO
	glGenTextures( 1, objTex );
	glBindTexture( GL_TEXTURE_2D, *objTex );
	glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
	glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	//glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR );
	//  ^^^ Questo sballa quando ridimensiono la finestra perché non vengono generate le mipmap di risoluzione inferiore
	//      Inoltre si fotte le cubemap!
	//glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP);
	//glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP);
	//glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE );
	//glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE );
	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT );
	glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT );
	glTexParameteri( GL_TEXTURE_2D, GL_GENERATE_MIPMAP, GL_TRUE ); // automatic mipmap generation included in OpenGL v1.4 (ma non funzionano lo stesso)
	glTexImage2D( GL_TEXTURE_2D, 0, GL_RGBA8, xSize, ySize, 0, GL_RGBA, GL_UNSIGNED_BYTE, 0 );
	glBindTexture( GL_TEXTURE_2D, 0 );

	// creazione FBO
	glGenFramebuffers( 1, obj );
	glBindFramebuffer( GL_FRAMEBUFFER, *obj );
	glFramebufferTexture2D( GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, *objTex, 0 );
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
		1.0f, 1.0f,
		-1.0f, 1.0f,
		0.0f, 1.0f,		// coordinate della texture già girate
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

