#include "SaraShaderManager.h"

SaraShaderManager::SaraShaderManager( std::string vertShaderFilename, std::string fragmShaderFilename ) :
			vertexShaderFilename( vertShaderFilename),
			fragmentShaderFilename( fragmShaderFilename ) {

	compileShaders();
}

SaraShaderManager::SaraShaderManager( std::string vertShaderFilename, std::vector<std::string> fragmShaderFilenameVector ) :
			vertexShaderFilename( vertShaderFilename ),
			fragmentShaderFilenameVector( fragmShaderFilenameVector ),
			currentFragShd( SaraGlobal::shaderNumber ) {

	fragmentShaderFilename = fragmentShaderFilenameVector[currentFragShd];
	compileShaders();
}

SaraShaderManager::~SaraShaderManager() {}

GLuint SaraShaderManager::getPipeline() {
	return mainPipeline;
}

void SaraShaderManager::checkGlobalShd() {
	if (SaraGlobal::shaderNumber != currentFragShd) {
		currentFragShd = SaraGlobal::shaderNumber;
		fragmentShaderFilename = fragmentShaderFilenameVector[currentFragShd];
		compileShaders();
	}
}


void SaraShaderManager::compileShaders( void ) {

	vertexShaderSource = filetobuf( vertexShaderFilename.c_str() );
	fragmentShaderSource = filetobuf( fragmentShaderFilename.c_str() );
	GLint isLinked;

	vertexShaderProgram = glCreateShaderProgramv( GL_VERTEX_SHADER, 1, &vertexShaderSource );
	glGetProgramiv( vertexShaderProgram, GL_LINK_STATUS, &isLinked );
	if (isLinked == GL_FALSE) {
		int maxLength;
		char *vertexInfoLog;
		std::cout << "Vertex shader compile failed" << std::endl;
		glGetProgramiv( vertexShaderProgram, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetProgramInfoLog( vertexShaderProgram, maxLength, &maxLength, vertexInfoLog );
		std::cout << vertexInfoLog << std::endl;
		free( vertexInfoLog );
		return;
	}
	else {
		std::cout << "Vertex shader successfully compiled" << std::endl;
	}

	fragmentShaderProgram = glCreateShaderProgramv( GL_FRAGMENT_SHADER, 1, &fragmentShaderSource );
	glGetProgramiv( fragmentShaderProgram, GL_LINK_STATUS, &isLinked );
	if (isLinked == GL_FALSE) {
		int maxLength;
		char *vertexInfoLog;
		std::cout << "Shader compile failed" << std::endl;
		glGetProgramiv( fragmentShaderProgram, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetProgramInfoLog( fragmentShaderProgram, maxLength, &maxLength, vertexInfoLog );
		std::cout << vertexInfoLog << std::endl;
		free( vertexInfoLog );
		return;
	}
	else {
		std::cout << "Fragment shader successfully compiled" << std::endl;
	}

	glGenProgramPipelines( 1, &mainPipeline );
	glUseProgramStages( mainPipeline, GL_VERTEX_SHADER_BIT, vertexShaderProgram );
	glUseProgramStages( mainPipeline, GL_FRAGMENT_SHADER_BIT, fragmentShaderProgram );
	res_x_loc		= glGetUniformLocation( fragmentShaderProgram, "res_x" );
	res_y_loc		= glGetUniformLocation( fragmentShaderProgram, "res_y" );
	time_loc		= glGetUniformLocation( fragmentShaderProgram, "time" );
	tex_loc			= glGetUniformLocation( fragmentShaderProgram, "tex" );
	offc_loc		= glGetUniformLocation( fragmentShaderProgram, "Offc" );
	angle_loc		= glGetUniformLocation( fragmentShaderProgram, "angle" );
	cameraOrg_loc	= glGetUniformLocation( fragmentShaderProgram, "cameraOrg" );
	cameraTrg_loc	= glGetUniformLocation( fragmentShaderProgram, "cameraTrg" );
	cameraUpd_loc	= glGetUniformLocation( fragmentShaderProgram, "cameraUpd" );
}

void SaraShaderManager::setUniforms( int resX, int resY, float time, int tex, float offc ) {
	glProgramUniform1i( fragmentShaderProgram, res_x_loc, resX );
	glProgramUniform1i( fragmentShaderProgram, res_y_loc, resY );
	glProgramUniform1f( fragmentShaderProgram, time_loc, time );
	// Solo postProcess
	glProgramUniform1i( fragmentShaderProgram, tex_loc, tex );		// impostare sempre a 0!
	glProgramUniform1f( fragmentShaderProgram, offc_loc, offc );
}

void SaraShaderManager::setUniforms( int resX, int resY, float time ) {
	glProgramUniform1i( fragmentShaderProgram, res_x_loc, resX );
	glProgramUniform1i( fragmentShaderProgram, res_y_loc, resY );
	glProgramUniform1f( fragmentShaderProgram, time_loc, time );
	glProgramUniform2fv( fragmentShaderProgram, angle_loc, 1, SaraGlobal::angle );
}

void SaraShaderManager::setUniforms( int resX, int resY, float time, glm::vec3 camOrg, glm::vec3 camTrg, glm::vec3 camUpd ) {
	glProgramUniform1i( fragmentShaderProgram, res_x_loc, resX );
	glProgramUniform1i( fragmentShaderProgram, res_y_loc, resY );
	glProgramUniform1f( fragmentShaderProgram, time_loc, time );
	glProgramUniform3fv( fragmentShaderProgram, cameraOrg_loc, 1, glm::value_ptr(camOrg) );
	glProgramUniform3fv( fragmentShaderProgram, cameraTrg_loc, 1, glm::value_ptr(camTrg) );
	glProgramUniform3fv( fragmentShaderProgram, cameraUpd_loc, 1, glm::value_ptr(camUpd) );
}


GLchar* SaraShaderManager::filetobuf( const char *file ) {
	FILE *fptr;
	long length;
	GLchar *buf;

	fopen_s( &fptr, file, "rb" );
	if (!fptr)
		return NULL;

	fseek( fptr, 0, SEEK_END );
	length = ftell( fptr );
	buf = (char*)malloc( length + 1 );
	fseek( fptr, 0, SEEK_SET );
	fread( buf, length, 1, fptr );
	fclose( fptr );
	buf[length] = 0;
	return buf;
}