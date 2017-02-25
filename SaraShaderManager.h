#pragma once
#include <iostream>
#include <string>
#include <gl\glew.h>
#include <GLFW\glfw3.h>

#include "Sara.h"

class SaraShaderManager {
public:
	SaraShaderManager( std::string vertexShaderFilename, std::string fragmentShaderFilename );
	~SaraShaderManager();

	void setupShaders();
	void compileShaders();

	GLuint getPipeline();

	void	setUniforms( int resX, int resY, float time );
	void	setUniforms( int resX, int resY, float time, int tex, float offc );


private:
	GLchar* filetobuf( const char *file );

	// Filebuffers and filenames
	GLchar					*vertexShaderSource;
	GLchar					*fragmentShaderSource;
	std::string				vertexShaderFilename;
	std::string				fragmentShaderFilename;

	// Shader Programs
	GLuint					vertexShaderProgram;
	GLuint					fragmentShaderProgram;
	// Pipelines
	GLuint					mainPipeline;

	// Uniform locations
	GLuint					res_x_loc;
	GLuint					res_y_loc;
	GLuint					time_loc;
	GLuint					camera_loc;
	GLuint					tex_loc;
	GLuint					offc_loc;

	// coordinate rotazione
	float					rotaz[3];

};