#pragma once
#include <iostream>
#include <gl\glew.h>
#include <GLFW\glfw3.h>
#include <glm\vec2.hpp>
#include <AntTweakBar.h>
#include "Sara.h"

void error_callback( int error, const char* description );
void key_callback( GLFWwindow* window, int key, int scancode, int action, int mods );
void cursor_position_callback( GLFWwindow* window, double xpos, double ypos );
void mouse_button_callback( GLFWwindow* window, int button, int action, int mods );
void scroll_callback( GLFWwindow* window, double xoffset, double yoffset );
//void character_callback( GLFWwindow* window, unsigned int codepoint );